class ApiMaker::CommandRequestExecutor < ApiMaker::ApplicationService
  arguments :controller, :payload

  def perform
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
