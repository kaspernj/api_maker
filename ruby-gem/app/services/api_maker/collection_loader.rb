class ApiMaker::CollectionLoader < ApiMaker::ApplicationService
  attr_reader :ability, :args, :collection, :locals, :params

  def initialize(args:, ability:, collection:, locals: nil, params: {})
    @ability = ability
    @args = args
    @collection = collection
    @locals = locals || args[:locals] || {}
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
      locals: locals,
      query_params: params
    ).result
  end

  def distinct_query
    @query = @query.distinct if params[:distinct]
  end

  def group_query
    return if params[:group_by].blank?

    column_name = params[:group_by].to_s
    raise "Not a valid column name: #{column_name}" unless collection.klass.column_names.include?(column_name)

    arel_column = collection.klass.arel_table[column_name]
    @query = @query.group(arel_column)
  end

  def limit_query
    @query = @query.limit(params[:limit]) if params[:limit].present?
  end

  def include_pagination_data(response, collection)
    return if params[:page].blank?

    countable_collection = collection.except(:distinct).except(:select).except(:order)

    response[:meta] = {
      currentPage: collection.current_page,
      perPage: collection.try(:per_page) || collection.limit_value,
      totalCount: countable_collection.try(:total_count) || countable_collection.total_entries,
      totalPages: countable_collection.total_pages
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
    group_query
    distinct_query
    @query = @query.ransack(params[:q]).result
    limit_query
    @query = @query.page(params[:page]) if params[:page].present?
    @query = @query.per_page(params[:per]) if params[:per].present?
    @query = filter_custom_accessible_by(@query)
  end
end
