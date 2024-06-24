class ApiMaker::CreateCommand < ApiMaker::BaseCommand
  attr_reader :model, :serializer

  def execute!
    ApiMaker::Configuration.profile(-> { "CreateCommand: #{model_class.name}" }) do
      @model = model_class.new
      @serializer = serialized_resource(model)
      sanitized_parameters = sanitize_parameters
      @model.assign_attributes(sanitized_parameters)

      if !current_ability.can?(:create, model)
        failure_response(errors: ["No access to create #{model_class.name}"])
      elsif model.save
        success_response
      else
        failure_save_response(model:, params: sanitized_parameters, simple_model_errors: simple_model_errors?)
      end
    end
  end

  def api_maker_resource_class
    @api_maker_resource_class ||= "Resources::#{model_class.name}Resource".constantize
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
    serializer.resource_instance.permitted_params(ApiMaker::PermittedParamsArgument.new(command: self, model:))
  end

  def success_response
    succeed!(
      model: serialized_model(model),
      success: true
    )
  end
end
