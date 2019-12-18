class ApiMaker::UpdateCommand < ApiMaker::BaseCommand
  attr_reader :command, :model, :params, :serializer

  def execute!
    each_command do |command|
      @command = command
      @model = command.model
      @params = command.args || {}
      @serializer = serialized_resource(model)
      sanitized_parameters = sanitize_parameters

      if command.model.update(sanitized_parameters)
        success_response
      else
        failure_save_response(model: command.model, params: sanitized_parameters)
      end
    end

    ServicePattern::Response.new(success: true)
  end

  def sanitize_parameters
    serializer.resource_instance.permitted_params(ApiMaker::PermittedParamsArgument.new(command: command, model: model))
  end

  def serialized_resource(model)
    ApiMaker::Serializer.new(ability: current_ability, args: api_maker_args, model: model)
  end

  def success_response
    command.result(
      model: serializer.result,
      success: true
    )
  end
end
