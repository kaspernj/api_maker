class ApiMaker::CommandRequestExecutor < ApiMaker::ApplicationService
  arguments :controller, :payload

  # Contract: pool -> command type -> resource -> command name -> command id
  # -> command entry. Every level, including each command entry, must be a
  # Hash. Validating the shape here (instead of letting String/Integer/Array
  # payloads crash mid-iteration) keeps malformed client input a 400 and
  # keeps the offending payload observable. The first level checks pool_data
  # itself, so a missing (nil) pool is named too.
  POOL_LEVELS = ["pool", "command type", "resource", "command name", "command entry"].freeze
  MALFORMED_SNIPPET_MAX_LENGTH = 200

  # Process-wide counter so repeated rejections are visible in the logs even
  # though each request only sees its own occurrence.
  MALFORMED_REQUEST_COUNTER = {count: 0}.freeze
  MALFORMED_REQUEST_COUNTER_MUTEX = Mutex.new

  def self.malformed_request_count
    MALFORMED_REQUEST_COUNTER[:count]
  end

  def perform
    validate_command_pool!

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
    @pool_data ||= merged_payload[:pool] || merged_payload["pool"]
  end

  # Walks the whole command pool before any command runs. Each level must be
  # a Hash; anything else (String, Integer, Array, nil, ...) is rejected with
  # a MalformedCommandRequestError naming the path and the received class.
  def validate_command_pool!
    each_pool_level(pool_data, path: ["pool"], levels: POOL_LEVELS)
  rescue ApiMaker::MalformedCommandRequestError => e
    MALFORMED_REQUEST_COUNTER_MUTEX.synchronize { MALFORMED_REQUEST_COUNTER[:count] += 1 }

    # Keep the rejection observable (log + counter) without creating a bug
    # report: the request details come from the controller because the
    # executor itself is a plain service.
    request = controller.respond_to?(:request) ? controller.request : nil

    Rails.logger.warn(
      "api_maker_malformed_command_request count=#{MALFORMED_REQUEST_COUNTER[:count]} " \
      "path=#{request&.path.inspect} method=#{request&.request_method.inspect} " \
      "user_agent=#{request&.user_agent.to_s[0, 100].inspect} #{e.message}"
    )

    raise e
  end

  def each_pool_level(node, path:, levels:)
    raise ApiMaker::MalformedCommandRequestError, malformed_level_message(node, path:, level: levels.first) unless node.is_a?(Hash)

    return if levels.length == 1

    node.each do |key, child|
      each_pool_level(child, path: path + [key.to_s], levels: levels[1..])
    end
  end

  # Redacted snippet: class plus a short truncated inspect, so the caller can
  # be identified without logging full request bodies (payloads may contain
  # personal data).
  def malformed_level_message(node, path:, level:)
    snippet = node.inspect
    snippet = "#{snippet[0, MALFORMED_SNIPPET_MAX_LENGTH]}..." if snippet.length > MALFORMED_SNIPPET_MAX_LENGTH

    "Malformed command request: #{level} at '#{path.join(" -> ")}' must be a Hash, got #{node.class} (#{snippet})"
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
