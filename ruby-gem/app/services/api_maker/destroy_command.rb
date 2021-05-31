class ApiMaker::DestroyCommand < ApiMaker::BaseCommand
  attr_reader :serializer

  def execute!
    @serializer = serialized_resource(model)

    if command.model.destroy
      success_response
    else
      failure_response
    end
  end

  def errors_for_model
    ActiveRecordBetterDependentErrorMessages::DestroyValidator.(model: model) if model.errors.full_messages.empty?
    model.errors.full_messages
  end

  def failure_response
    fail!(
      model: serialized_model(model),
      success: false,
      errors: errors_for_model
    )
  end

  def success_response
    succeed!(
      model: serialized_model(model),
      success: true
    )
  end
end
