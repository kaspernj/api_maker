class ApiMaker::UpdateCommand < ApiMaker::BaseCommand
  attr_reader :params

  def execute!
    each_command do |command|
      @params = command.args || {}

      if command.model.update(sanitize_parameters)
        success_response
        after_update
      else
        failure_response
      end

      command.result(response)
    end
  end

  def api_maker_resource_class
    @api_maker_resource_class ||= "Resources::#{short_plural_name.singularize}Resource".constantize
  end

  def short_plural_name
    self.class.name.match(/\AApiMaker::(.+)Controller\Z/)[1]
  end

  def failure_response
    render json: {
      model: serialized_resource(resource_instance).result,
      success: false,
      errors: resource_instance.errors.full_messages
    }
  end

  def resource_instance_class_name
    @resource_instance_class_name ||= self.class.name.split("::").last.gsub(/Controller$/, "").singularize
  end

  def resource_instance_class
    @resource_instance_class ||= api_maker_resource_class.model_class
  end

  def resource_instance
    @resource_instance ||= proc do
      instance_variable_get("@#{resource_variable_name}")
    end.call
  end

  def resource_variable_name
    @resource_variable_name ||= resource_instance_class_name.underscore.parameterize
  end

  def sanitize_parameters
    @sanitize_parameters ||= __send__("#{resource_variable_name}_params")
  end

  def serialized_resource(model)
    ApiMaker::Serializer.new(ability: current_ability, args: api_maker_args, model: model)
  end

  def set_instance
    return if params[:id].blank?
    model = resource_instance_class.accessible_by(current_ability, action_name.to_sym).find(params[:id])
    raise CanCan::AccessDefined.new(not_authorized_message(action_name, resource_instance_class), :read, resource_instance_class) unless model
    instance_variable_set("@#{resource_variable_name}", model)
  end

  def set_new_instance
    model = resource_instance_class.new(sanitize_parameters)
    authorize!(action_name.to_sym, model, message: not_authorized_message(action_name, model))
    instance_variable_set("@#{resource_variable_name}", model)
  end

  def success_response
    render json: {
      model: serialized_resource(resource_instance).result,
      success: true
    }
  end

  def not_authorized_message(action, model)
    if model.is_a?(ActiveRecord::Base)
      model_name = model.class.name
    else
      model_name = model.name
    end

    "Not authorized to \"#{action}\" on #{model_name}"
  end
end
