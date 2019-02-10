class ApiMaker::UpdateCommand < ApiMaker::BaseCommand
  attr_reader :command, :model, :params, :serializer

  def execute!
    each_command do |command|
      @command = command
      @model = command.model
      @params = command.args || {}
      @serializer = serialized_resource(model)

      if command.model.update(sanitize_parameters)
        success_response
      else
        failure_response
      end
    end
  end

  def api_maker_resource_class
    @api_maker_resource_class ||= "Resources::#{collection.klass.name}Resource".constantize
  end

  def failure_response
    command.fail(
      model: serializer.result,
      success: false,
      errors: model.errors.full_messages
    )
  end

  def resource_instance_class_name
    @resource_instance_class_name ||= self.class.name.split("::").last.gsub(/Controller$/, "").singularize
  end

  def resource_instance_class
    @resource_instance_class ||= api_maker_resource_class.model_class
  end

  def resource_variable_name
    @resource_variable_name ||= resource_instance_class_name.underscore.parameterize
  end

  def sanitize_parameters
    serializer.resource_instance.permitted_params(params)
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
