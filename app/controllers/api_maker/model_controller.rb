class ApiMaker::ModelController < ApiMaker::BaseController
  load_and_authorize_resource

  def index
    self.collection_instance = collection_instance.ransack(params[:q]).page(params[:page])

    render json: {
      collection: collection_instance
    }
  end

  def show
    render json: {model: serialized_resource}
  end

  def new
    render json: {model: serialized_resource}
  end

  def create
    if resource_instance.save
      render json: {
        model: serialized_resource,
        success: true
      }
    else
      render json: {
        model: serialized_resource,
        success: false,
        errors: resource_instance.errors.full_messages
      }
    end
  end

  def edit
    render json: {model: serialized_resource}
  end

  def update
    if resource_instance.update(sanitize_parameters)
      render json: {
        model: serialized_resource,
        success: true
      }
    else
      render json: {
        model: serialized_resource,
        success: false,
        errors: resource_instance.errors.full_messages
      }
    end
  end

  def destroy
    if resource_instance.destroy
      render json: {
        model: serialized_resource,
        success: true
      }
    else
      render json: {
        model: serialized_resource,
        success: false,
        errors: resource_instance.errors.full_messages
      }
    end
  end

private

  def resource_instance
    @resource_instance ||= proc do
      variable_name = self.class.name.split("::").last.gsub(/Controller$/, "").singularize.parameterize
      instance_variable_get("@#{variable_name}")
    end.call
  end

  def serializer
    @serializer ||= ActiveModel::Serializer.get_serializer_for(resource_instance.class)
  end

  def serialized_resource
    @serialized_resource ||= serializer.new(resource_instance)
  end
end
