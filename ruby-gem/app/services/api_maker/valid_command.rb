class ApiMaker::ValidCommand < ApiMaker::BaseCommand
  attr_reader :serializer

  def execute!
    if command.model_id.present?
      model = resource_instance_class.find(command.model_id)
    else
      model = resource_instance_class.new
    end

    serializer = serialized_resource(model)
    model.assign_attributes(sanitize_parameters(serializer))

    succeed!(valid: model.valid?, errors: model.errors.full_messages)
  end

  def resource_instance_class
    collection.klass
  end

  def sanitize_parameters(serializer)
    serializer.resource_instance.permitted_params(ApiMaker::PermittedParamsArgument.new(command: self, model: serializer.model))
  end
end
