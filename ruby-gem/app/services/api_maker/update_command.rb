class ApiMaker::UpdateCommand < ApiMaker::BaseCommand
  attr_reader :serializer

  def execute!
    ApiMaker::Configuration.profile(-> { "UpdateCommand: #{model_class.name}" }) do
      @serializer = serialized_resource(model)
      sanitized_parameters = sanitize_parameters

      if command.model.update(sanitized_parameters)
        success_response
      else
        failure_save_response(model:, params: sanitized_parameters, simple_model_errors: simple_model_errors?)
      end
    end
  end

  def sanitize_parameters
    serializer.resource_instance.permitted_params(ApiMaker::PermittedParamsArgument.new(command: self, model:))
  end

  def success_response
    succeed!(
      model: serialized_model(model),
      success: true
    )
  end
end
