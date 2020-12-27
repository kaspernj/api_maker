class ApiMaker::UpdateCommand < ApiMaker::BaseCommand
  attr_reader :serializer

  def execute!
    @serializer = serialized_resource(model)
    sanitized_parameters = sanitize_parameters

    if command.model.update(sanitized_parameters)
      success_response
    else
      failure_save_response(model: model, params: sanitized_parameters)
    end
  end

  def sanitize_parameters
    serializer.resource_instance.permitted_params(ApiMaker::PermittedParamsArgument.new(command: command, model: model))
  end

  def success_response
    command.result(
      model: serialized_model(model),
      success: true
    )
  end
end
