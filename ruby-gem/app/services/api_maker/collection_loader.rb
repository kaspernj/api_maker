class ApiMaker::CollectionLoader < ApiMaker::ApplicationService
  attr_reader :ability, :args, :collection, :params

  def initialize(args:, ability:, collection:, params: {})
    @ability = ability
    @args = args
    @collection = collection
    @params = params
  end

  def execute
    set_query

    if params[:count]
      count = @query.count
      count = count.length if count.is_a?(Hash)

      succeed!(count: count)
    else
      collection = collection_from_query(@query)
      response = collection.as_json
      include_pagination_data(response, @query)

      succeed!(response)
    end
  end

  def filter_custom_accessible_by(collection)
    return collection if params[:accessible_by].blank?

    collection.accessible_by(ability, params[:accessible_by].to_sym)
  end

  def collection_from_query(collection)
    ApiMaker::CollectionSerializer.new(
      ability: ability,
      args: args,
      collection: collection,
      query_params: params
    ).result
  end

  def include_pagination_data(response, collection)
    return if params[:page].blank?

    response[:meta] = {
      currentPage: collection.current_page,
      perPage: collection.try(:per_page) || collection.limit_value,
      totalCount: collection.try(:total_count) || collection.total_entries,
      totalPages: collection.total_pages
    }
  end

  def manage_through_relationship
    return if params[:through].blank?

    model_class = params[:through][:model].safe_constantize
    through_model = model_class.accessible_by(ability).find(params[:through][:id])
    association = ActiveRecord::Associations::Association.new(through_model, model_class.reflections.fetch(params[:through][:reflection]))

    query_through = association.scope
    query_through = query_through.accessible_by(ability)
    query_through = filter_custom_accessible_by(query_through)
    query_through
  end

  def set_query
    @query = manage_through_relationship || collection
    @query = @query.distinct if params[:distinct]
    @query = @query.ransack(params[:q]).result
    @query = @query.limit(params[:limit]) if params[:limit].present?
    @query = @query.page(params[:page]) if params[:page].present?
    @query = @query.per_page(params[:per]) if params[:per].present?
    @query = filter_custom_accessible_by(@query)
  end
end
