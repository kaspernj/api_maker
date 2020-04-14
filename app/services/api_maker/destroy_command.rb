class ApiMaker::DestroyCommand < ApiMaker::BaseCommand
  attr_reader :command, :model, :params, :serializer

  def execute!
    each_command do |command|
      @command = command
      @model = command.model
      @params = command.args || {}
      @serializer = serialized_resource(model)

      if command.model.destroy
        success_response
      else
        failure_response
      end
    end
  end

  def errors_for_model
    ActiveRecordBetterDependentErrorMessages::DestroyValidator.(model: model) if model.errors.full_messages.empty?
    model.errors.full_messages
  end

  def failure_response
    command.fail(
      model: serialized_model(model),
      success: false,
      errors: errors_for_model
    )
  end

  def success_response
    command.result(
      model: serialized_model(model),
      success: true
    )
  end
end
