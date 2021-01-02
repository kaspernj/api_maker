class ApiMaker::ServiceCommand < ApiMaker::BaseCommand
  def execute!
    service_name = args.fetch(:service_name)
    service_constant_name = "Services::#{service_name}"
    service_constant = service_constant_name.constantize
    service_args = args.fetch(:service_args)&.permit!&.to_h
    response = service_constant.execute(
      ability: current_ability,
      args: service_args,
      api_maker_args: api_maker_args,
      controller: controller
    )

    if response.success?
      succeed!(response.result)
    else
      fail!(errors: response.error_messages)
    end
  end
end
