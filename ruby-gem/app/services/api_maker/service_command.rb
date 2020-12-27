class ApiMaker::ServiceCommand < ApiMaker::BaseCommand
  def execute!
    service_name = args.fetch(:service_name)
    service_constant_name = "Services::#{service_name}"
    service_constant = service_constant_name.constantize
    service_args = args.fetch(:service_args)&.permit!&.to_h
    service_instance = service_constant.new(
      ability: current_ability,
      args: service_args,
      api_maker_args: api_maker_args,
      controller: controller
    )
    response = service_instance.execute

    if response.success?
      command.result(response.result)
    else
      command.fail(errors: response.error_messages)
    end
  end
end
