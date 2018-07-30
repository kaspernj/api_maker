class ApiMaker::ModelController < ApiMaker::BaseController
  load_and_authorize_resource

  def index
    ransack = resource_collection.ransack(params[:q])
    query = ransack.result.page(params[:page])

    collection = query.distinct.fix.map do |model|
      serialized_resource(model).to_hash
    end

    render json: {collection: collection}
  end

  def show
    render json: {model: serialized_resource(resource_instance)}
  end

  def new
    render json: {model: serialized_resource(resource_instance)}
  end

  def create
    if resource_instance.save
      render json: {
        model: serialized_resource(resource_instance),
        success: true
      }
    else
      render json: {
        model: serialized_resource(resource_instance),
        success: false,
        errors: resource_instance.errors.full_messages
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
        success: true
      }
    else
      render json: {
        model: serialized_resource(resource_instance),
        success: false,
        errors: resource_instance.errors.full_messages
      }
    end
  end

  def destroy
    if resource_instance.destroy
      render json: {
        model: serialized_resource(resource_instance),
        success: true
      }
    else
      render json: {
        model: serialized_resource(resource_instance),
        success: false,
        errors: resource_instance.errors.full_messages
      }
    end
  end

private

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
    @serialized_resource ||= serializer.new(model)
  end
end
