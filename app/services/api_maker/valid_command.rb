class ApiMaker::ValidCommand < ApiMaker::BaseCommand
  attr_reader :command, :model, :params, :serializer

  def execute!
    each_command do |command|
      @command = command
      @params = command.args || {}

      if command.model_id.present?
        model = resource_instance_class.find(command.model_id)
      else
        model = resource_instance_class.new
      end

      serializer = serialized_resource(model)
      model.assign_attributes(sanitize_parameters(serializer))

      command.result(valid: model.valid?, errors: model.errors.full_messages)
    end
  end

  def resource_instance_class
    collection.klass
  end

  def sanitize_parameters(serializer)
    serializer.resource_instance.permitted_params(ApiMaker::PermittedParamsArgument.new(command: command, model: serializer.model))
  end
end
