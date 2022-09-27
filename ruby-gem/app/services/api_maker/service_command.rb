class ApiMaker::ServiceCommand < ApiMaker::BaseCommand
  def execute!
    service_name = args.fetch(:service_name)

    ApiMaker::Configuration.profile(-> { "ServiceCommand: #{service_name}" }) do
      service_constant_name = "Services::#{service_name}"
      service_constant = service_constant_name.constantize
      service_args = if args[:service_args]
        args.fetch(:service_args)&.permit!&.to_h
      else
        {}
      end

      response = service_constant.execute(args: service_args, controller: controller)

      if response.success?
        succeed!(response.result)
      else
        errors = response.errors.map do |error|
          {message: error.message, type: error.type}
        end

        fail!(errors: errors)
      end
    end
  end
end
