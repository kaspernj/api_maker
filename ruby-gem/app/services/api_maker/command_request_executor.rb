class ApiMaker::CommandRequestExecutor < ApiMaker::ApplicationService
  arguments :controller, :payload

  def perform
    with_request_context do
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

  def command_response
    @command_response ||= ApiMaker::CommandResponse.new(controller:)
  end

  def merged_payload
    @merged_payload ||= if payload.key?("json")
      raw_payload = payload.except("json")
      ApiMaker::DeepMergeParams.execute!(payload.fetch("json"), raw_payload)
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
