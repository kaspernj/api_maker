class ApiMaker::ModelController < ApiMaker::BaseController
  load_and_authorize_resource :resource, class_name: ""

  def index
    self.collection_instance = collection_instance.page(params[:page])

    render json: {
      collection: collection_instance
    }
  end

  def show
    render json: {instance_name => resource_instance.to_json}
  end

  def new
    render json: {instance_name => resource_instance.to_json}
  end

  def create
    if resource_instance.save
      render json: {
        instance_name => resource_instance.to_json,
        success: true
      }
    else
      render json: {
        instance_name => resource_instance.to_json,
        success: false,
        errors: resource_instance.errors.full_messages
      }
    end
  end

  def edit
    render json: {instance_name => resource_instance.to_json}
  end

  def update
    if resource_instance.update(sanitize_parameters)
      render json: {
        instance_name => resource_instance.to_json,
        success: true
      }
    else
      render json: {
        instance_name => resource_instance.to_json,
        success: false,
        errors: resource_instance.errors.full_messages
      }
    end
  end

  def destroy
    if resource_instance.destroy
      render json: {
        instance_name => resource_instance.to_json,
        success: true
      }
    else
      render json: {
        instance_name => resource_instance.to_json,
        success: false,
        errors: resource_instance.errors.full_messages
      }
    end
  end
end
