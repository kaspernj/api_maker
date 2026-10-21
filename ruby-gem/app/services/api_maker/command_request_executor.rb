class ApiMaker::CommandRequestExecutor < ApiMaker::ApplicationService
  arguments :controller, :payload

  def perform
    validate_select_payloads!

    with_request_context do
      # The frontend's believed user is reconciled against the real one only
      # after the request context has synced the authoritative current user.
      # On divergence we short-circuit before running any command, so no
      # misleading "not found / no access" error is raised or reported.
      if authentication_diverged?
        succeed!({success: false, type: :authentication_changed})
      else
        pool_data.each do |command_type, command_type_data|
          command_type_data.each do |resource_plural_name, command_model_data|
            command_model_data.each do |command_name, command_data|
              ApiMaker.const_get("#{command_type.camelize}CommandService").execute!(
                ability: controller.__send__(:current_ability),
                api_maker_args: controller.__send__(:api_maker_args),
                command_response:,
                commands: normalize_commands(command_data),
                command_name: command_name.to_s,
                controller:,
                resource_name: resource_plural_name.to_s
              )
            end
          end
        end

        command_response.join_threads

        succeed!({responses: command_response.result})
      end
    end
  end

  def authentication_diverged?
    # Only member/collection commands load records through abilities and can
    # surface a misleading "not found / no access" on stale auth. Service
    # commands (notably the Devise session-refresh services used to recover
    # from a divergence) must never be gated, or recovery could not run.
    return false unless reconcilable_command_types?

    ApiMaker::AuthenticationReconciler.diverged?(
      believed_user_ids:,
      actual_user_id_for: method(:actual_user_id_for)
    )
  end

  def reconcilable_command_types?
    pool_data.keys.map(&:to_s).intersect?(%w[member collection])
  end

  def believed_user_ids
    global = merged_payload[:global] || merged_payload["global"]
    return unless global.is_a?(Hash)

    global[:believed_devise_user_ids] || global["believed_devise_user_ids"]
  end

  def actual_user_id_for(scope)
    controller.__send__(:api_maker_args)[:"current_#{scope}"]&.id
  end

  def command_response
    @command_response ||= ApiMaker::CommandResponse.new(controller:)
  end

  def merged_payload
    @merged_payload ||= if payload.key?("json") && !payload.key?("pool") && !payload.key?(:pool)
      json_payload = payload.fetch("json")
      json_payload = JSON.parse(json_payload) if json_payload.is_a?(String)
      raw_payload = payload.except("json")
      ApiMaker::DeepMergeParams.execute!(json_payload, raw_payload)
    else
      payload
    end
  end

  def pool_data
    @pool_data ||= merged_payload[:pool] || merged_payload.fetch("pool")
  end

  # A select payload naming an attribute the resource does not expose is a
  # client contract error: the payload is well-formed but the client and the
  # API disagree about the resource surface. Validate every pool select before
  # any command runs, so an unknown attribute rejects the whole request with a
  # 400 naming the resource and the attribute instead of crashing mid-command
  # with a 500 RuntimeError that files a server-side bug report. The parser
  # itself still raises for select paths outside the command pool.
  def validate_select_payloads!
    unknown_select = unknown_select_attribute_in_pool
    return unless unknown_select

    # Keep the rejection observable (log + counter) without creating a bug
    # report: the request details come from the controller because the
    # executor itself is a plain service.
    request = controller.respond_to?(:request) ? controller.request : nil

    Rails.logger.warn(
      "api_maker_unknown_select_attribute count=#{ApiMaker::SelectParser.unknown_select_attribute_count} " \
      "path=#{request&.path.inspect} method=#{request&.request_method.inspect} " \
      "user_agent=#{request&.user_agent.to_s[0, 100].inspect} message=#{unknown_select.message.inspect}"
    )

    raise unknown_select
  end

  # Pool shape: type => resource plural => command name => id => entry. Walk
  # every well-formed command entry and return the first parser rejection.
  def unknown_select_attribute_in_pool
    return unless pool_data.is_a?(Hash)

    each_command_entry do |command_entry|
      error = unknown_select_error_for_entry(command_entry)
      return error if error
    end

    nil
  end

  def each_command_entry(&)
    pool_data.each_value do |command_type_data|
      next unless command_type_data.is_a?(Hash)

      command_type_data.each_value do |command_model_data|
        next unless command_model_data.is_a?(Hash)

        command_model_data.each_value do |commands_by_id|
          next unless commands_by_id.is_a?(Hash)

          commands_by_id.each_value do |command_entry|
            yield command_entry if command_entry.is_a?(Hash)
          end
        end
      end
    end
  end

  def unknown_select_error_for_entry(command_entry)
    # The frontend sends select inside the command args (index queries).
    args = command_entry[:args] || command_entry["args"]
    return unless args.is_a?(Hash)

    select_payload = args[:select] || args["select"]
    return unless select_payload.is_a?(Hash)

    # Reuse the parser itself so validation and execution accept exactly the
    # same select contract.
    ApiMaker::SelectParser.execute!(select: select_payload)

    nil
  rescue ApiMaker::UnknownSelectAttributeError => e
    e
  end

  def normalize_commands(command_data)
    command_data.to_h.transform_values do |value|
      if value.respond_to?(:with_indifferent_access)
        value.with_indifferent_access
      else
        value
      end
    end
  end

  def with_request_context(&)
    if controller.respond_to?(:with_request_context)
      controller.with_request_context(&)
    else
      yield
    end
  end
end
