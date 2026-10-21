class ApiMaker::CommandRequestExecutor < ApiMaker::ApplicationService
  arguments :controller, :payload

  # Only member/collection commands resolve an application command constant
  # ("Commands::<Resource>::<Name>"). The other command types are built into
  # the gem and have no per-app constant to verify.
  APP_COMMAND_TYPES = %w[member collection].freeze

  # Process-wide counter so repeated unknown-command rejections stay visible
  # in the logs even though each request only sees its own occurrence.
  UNKNOWN_COMMAND_COUNTER = {count: 0}
  UNKNOWN_COMMAND_COUNTER_MUTEX = Mutex.new

  def self.unknown_command_count
    UNKNOWN_COMMAND_COUNTER[:count]
  end

  def perform
    validate_command_constants!

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

  # A member/collection command name that resolves to no application constant
  # is a client contract error. Reject the whole request before any command
  # runs, so an unknown command answers 400 instead of crashing with a 500
  # NameError and filing a server-side bug report.
  def validate_command_constants!
    unknown = unknown_command_in_pool
    return unless unknown

    UNKNOWN_COMMAND_COUNTER_MUTEX.synchronize { UNKNOWN_COMMAND_COUNTER[:count] += 1 }

    # Keep the rejection observable (log + counter) without creating a bug
    # report: the request details come from the controller because the
    # executor itself is a plain service.
    request = controller.respond_to?(:request) ? controller.request : nil

    Rails.logger.warn(
      "api_maker_unknown_command count=#{UNKNOWN_COMMAND_COUNTER[:count]} " \
      "path=#{request&.path.inspect} method=#{request&.request_method.inspect} " \
      "user_agent=#{request&.user_agent.to_s[0, 100].inspect} #{unknown.fetch(:message)}"
    )

    raise ApiMaker::UnknownCommandError, unknown.fetch(:message)
  end

  def unknown_command_in_pool
    # Malformed (non-Hash) pool shapes are rejected by the shape validation
    # in STC-633's change; here we only inspect well-formed pools.
    return unless pool_data.is_a?(Hash)

    pool_data.each do |command_type, command_type_data|
      next unless APP_COMMAND_TYPES.include?(command_type.to_s)
      next unless command_type_data.is_a?(Hash)

      command_type_data.each do |resource_plural_name, command_model_data|
        next unless command_model_data.is_a?(Hash)

        resource = resource_constant(resource_plural_name)
        # An unknown resource stays the service's own contract (it raises its
        # explicit error); only a resolvable resource with a missing command
        # constant counts as an unknown command here.
        next unless resource&.model_class

        command_model_data.each_key do |command_name|
          constant_name = "Commands::#{resource_plural_name.to_s.underscore.camelize}::#{command_name.to_s.camelize}"
          next if constant_name.safe_constantize

          return {constant_name:, message: "Unknown command: #{constant_name}"}
        end
      end
    end

    nil
  end

  # Mirrors ApiMaker::CommandService#resource so validation and execution
  # resolve exactly the same resource.
  def resource_constant(resource_plural_name)
    "Resources::#{resource_plural_name.to_s.underscore.singularize.camelize}Resource".safe_constantize
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
