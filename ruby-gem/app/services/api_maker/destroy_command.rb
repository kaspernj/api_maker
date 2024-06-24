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
    ActiveRecordBetterDependentErrorMessages::DestroyValidator.(model:) if model.errors.full_messages.empty?
    model.errors.full_messages
  end

  def failure_response
    fail!(
      error_type: :destroy_error,
      errors: errors_for_model,
      model: serialized_model(model),
      success: false
    )
  end

  def success_response
    succeed!(
      model: serialized_model(model),
      success: true
    )
  end
end
