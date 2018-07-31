class ApiMaker::ModelController < ApiMaker::BaseController
  load_and_authorize_resource

  def index
    query = resource_collection.ransack(params[:q]).ransack.result
    query = query.limit(params[:limit]) if params[:limit].present?
    query = query.page(params[:page]) if params[:page].present?
    query = query.distinct.fix

    render json: {collection: query}, include: include_param
  end

  def show
    render json: {model: serialized_resource(resource_instance)}, include: include_param
  end

  def new
    render json: {model: serialized_resource(resource_instance)}, include: include_param
  end

  def create
    if resource_instance.save
      render json: {
        model: serialized_resource(resource_instance),
        success: true,
        include: include_param
      }
    else
      render json: {
        model: serialized_resource(resource_instance),
        success: false,
        errors: resource_instance.errors.full_messages,
        include: include_param
      }
    end
  end

  def edit
    render json: {model: serialized_resource(resource_instance)}
  end

  def update
    if resource_instance.update(sanitize_parameters)
      render json: {
        model: serialized_resource(resource_instance),
        success: true,
        include: include_param
      }
    else
      render json: {
        model: serialized_resource(resource_instance),
        success: false,
        errors: resource_instance.errors.full_messages,
        include: include_param
      }
    end
  end

  def destroy
    if resource_instance.destroy
      render json: {
        model: serialized_resource(resource_instance),
        success: true,
        include: include_param
      }
    else
      render json: {
        model: serialized_resource(resource_instance),
        success: false,
        errors: resource_instance.errors.full_messages,
        include: include_param
      }
    end
  end

private

  def include_param
    return params[:include] if params[:include].present?

    if action_name == "index"
      return false
    else
      return " "
    end
  end

  def resource_collection
    @resource_collection ||= proc do
      variable_name = self.class.name.split("::").last.gsub(/Controller$/, "").parameterize
      instance_variable_get("@#{variable_name}")
    end.call
  end

  def resource_instance_class_name
    @resource_instance_class_name ||= self.class.name.split("::").last.gsub(/Controller$/, "").singularize
  end

  def resource_instance_class
    @resource_instance_class ||= resource_instance_class_name.constantize
  end

  def resource_instance
    @resource_instance ||= proc do
      instance_variable_get("@#{resource_variable_name}")
    end.call
  end

  def resource_variable_name
    @resource_variable_name ||= resource_instance_class_name.parameterize
  end

  def sanitize_parameters
    __send__("#{resource_variable_name}_params")
  end

  def serializer
    @serializer ||= ActiveModel::Serializer.get_serializer_for(resource_instance_class)
  end

  def serialized_resource(model)
    serializer.new(model)
  end
end
