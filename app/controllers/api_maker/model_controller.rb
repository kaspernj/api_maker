class ApiMaker::ModelController < ApiMaker::BaseController
  before_action :set_collection, on: :index
  before_action :set_instance, except: :index

  def index
    query = resource_collection.ransack(params[:q]).result
    query = query.limit(params[:limit]) if params[:limit].present?
    query = query.page(params[:page]) if params[:page].present?
    query = query.distinct.group(:id).fix

    collection = collection_from_query(query)

    response = collection.as_json
    include_pagination_data(response, query)

    render json: response
  end

  def show
    render json: {model: serialized_resource(resource_instance).result}
  end

  def new
    render json: {model: serialized_resource(resource_instance).result}
  end

  def create
    if resource_instance.save
      success_response
      after_create
    else
      failure_response
    end
  end

  def edit
    render json: {model: serialized_resource(resource_instance).result}
  end

  def update
    if resource_instance.update(sanitize_parameters)
      success_response
      after_update
    else
      failure_response
    end
  end

  def destroy
    if resource_instance.destroy
      success_response
      after_destroy
    else
      failure_response
    end
  end

  def validate
    if sanitize_parameters[:id]
      instance = resource_instance_class.find(sanitize_parameters[:id])
      instance.assign_attributes(sanitize_parameters)
    else
      instance = resource_instance_class.new(sanitize_parameters)
    end

    render json: {valid: instance.valid?, errors: instance.errors.full_messages}
  end

private

  def after_create; end

  def after_update; end

  def after_destroy; end

  def collection_from_query(query)
    ApiMaker::CollectionSerializer.new(ability: current_ability, args: api_maker_args, collection: query, include_param: include_param).result
  end

  def failure_response
    render json: {
      model: serialized_resource(resource_instance).result,
      success: false,
      errors: resource_instance.errors.full_messages
    }
  end

  def include_param
    params[:include]
  end

  def include_pagination_data(response, query)
    return if params[:page].blank?

    response[:meta] = {
      currentPage: query.current_page,
      totalCount: query.try(:total_count) || query.try(:total_entries),
      totalPages: query.total_pages
    }
  end

  def manage_through_relationship
    return if params[:through].blank?

    through_model = params[:through][:model].constantize.accessible_by(current_ability).find(params[:through][:id])
    relationship = through_model.__send__(params[:through][:reflection]).accessible_by(current_ability)
    instance_variable_set("@#{resource_collection_variable_name}", relationship)
  end

  def resource_collection
    @resource_collection ||= proc do
      manage_through_relationship
      instance_variable_get("@#{resource_collection_variable_name}")
    end.call
  end

  def resource_collection_variable_name
    @resource_collection_variable_name ||= self.class.name.split("::").last.gsub(/Controller$/, "").underscore.parameterize
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
    @resource_variable_name ||= resource_instance_class_name.underscore.parameterize
  end

  def sanitize_parameters
    @sanitize_parameters ||= __send__("#{resource_variable_name}_params")
  end

  def serialized_resource(model)
    ApiMaker::Serializer.new(ability: current_ability, args: api_maker_args, model: model)
  end

  def set_collection
    collection = resource_instance_class.accessible_by(current_ability)
    instance_variable_set("@#{resource_collection_variable_name}", collection)
  end

  def set_instance
    return if params[:id].blank?
    model = resource_instance_class.accessible_by(current_ability).find(params[:id])
    raise CanCan::AccessDefined.new("Not authorized!", :read, resource_instance_class) unless model
    instance_variable_set("@#{resource_variable_name}", model)
  end

  def success_response
    render json: {
      model: serialized_resource(resource_instance).result,
      success: true
    }
  end
end
