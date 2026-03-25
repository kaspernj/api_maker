class ApiMaker::ServiceCommand < ApiMaker::BaseCommand
  def execute!
    service_name = args.fetch(:service_name)

    ApiMaker::Configuration.profile(-> { "ServiceCommand: #{service_name}" }) do
      service_constant_name = "Services::#{service_name}"
      service_constant = service_constant_name.constantize
      service_args = if args[:service_args]
        raw_service_args = args.fetch(:service_args)

        if raw_service_args.respond_to?(:permit!)
          raw_service_args.permit!.to_h.with_indifferent_access
        else
          raw_service_args.to_h.with_indifferent_access
        end
      else
        {}
      end

      response = service_constant.execute(args: service_args, controller:)

      if response.success?
        succeed!(response.result)
      else
        errors = response.errors.map do |error|
          {message: error.message, type: error.type}
        end

        fail!(errors:)
      end
    end
  end
end
