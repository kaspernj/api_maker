class ApiMaker::CollectionLoader < ApiMaker::ApplicationService
  attr_reader :ability, :api_maker_args, :collection, :locals, :params

  def initialize(ability:, api_maker_args:, collection:, locals: nil, params: {})
    @ability = ability
    @api_maker_args = api_maker_args
    @collection = collection
    @locals = locals || api_maker_args&.dig(:locals) || {}
    @params = params
  end

  def perform
    set_query

    if params[:count]
      count = @query.size
      count = count.length if count.is_a?(Hash)

      succeed!(count:)
    else
      collection = collection_from_query(@query)
      response = {
        collection: collection.as_json
      }
      include_pagination_data(response, @query)
      succeed!(response)
    end
  end

  def filter_custom_accessible_by(collection)
    return collection if params[:accessible_by].blank?

    collection.accessible_by(ability, params[:accessible_by].to_sym)
  end

  def collection_from_query(collection)
    ApiMaker::CollectionSerializer
      .new(
        ability:,
        api_maker_args:,
        collection:,
        locals:,
        query_params: params
      )
      .result
  end

  def distinct_query
    @query = @query.distinct if params[:distinct]
  end

  def group_query
    return if params[:group_by].blank?

    params[:group_by].each do |group_by|
      if group_by.is_a?(Array)
        raise "Expected table and column but array length was wrong: #{group_by.length}" unless group_by.length == 2

        resource_class = group_by[0]
        column_name = group_by[1]
        model_class = resource_class.model_class
        raise "Not a valid column name: #{column_name}" unless model_class.column_names.include?(column_name)

        arel_column = model_class.arel_table[column_name]
      else
        arel_column = collection.klass.arel_table[group_by]
        raise "Not a valid column name: #{group_by}" unless collection.klass.column_names.include?(group_by)
      end

      @query = @query.group(arel_column)
    end
  end

  def limit_query
    @query = @query.limit(params[:limit]) if params[:limit].present?
  end

  def include_pagination_data(response, collection)
    return if params[:page].blank?

    countable_collection = collection.except(:distinct).except(:group).except(:select).except(:order)

    Rails.logger.debug { "API maker: CollectionLoader total pages for #{model_class.name}" }
    total_pages = ApiMaker::TotalPages.execute!(query: countable_collection)

    Rails.logger.debug { "API maker: CollectionLoader total count for #{model_class.name}" }
    total_count = ApiMaker::TotalCount.execute!(query: countable_collection)

    response[:meta] = {
      count: query_count,
      currentPage: ApiMaker::CurrentPage.execute!(query: collection),
      perPage: ApiMaker::PerPage.execute!(query: collection),
      totalCount: total_count,
      totalPages: total_pages
    }
  end

  def manage_through_relationship
    return if params[:through].blank?

    through_model_class = params[:through][:model].safe_constantize
    through_model = through_model_class.accessible_by(ability).find_by(through_model_class.primary_key => params[:through][:id])

    return if through_model.nil?

    reflection = through_model_class.reflections.fetch(params[:through][:reflection])
    association = ActiveRecord::Associations::Association.new(through_model, reflection)

    query_through = association.scope
    query_through = query_through.accessible_by(ability)

    filter_custom_accessible_by(query_through)
  end

  def model_class
    @model_class ||= collection.klass
  end

  def set_query
    @query = manage_through_relationship || collection
    group_query
    distinct_query
    @query = @query.ransack(params[:q]).result if params[:q]
    @query = @query.ransack(params[:ransack]).result if params[:ransack]
    limit_query
    @query = ApiMaker::Paginate.execute!(page: params[:page].to_i, per_page: params[:per], query: @query) if params[:page].present?
    @query = filter_custom_accessible_by(@query)

    filter_query_with_search_params if params[:search]
  end

  def filter_query_with_search_params
    ransack_params = ApiMaker::SearchToRansackParams.new(search: params[:search]).perform
    @query = @query.ransack(ransack_params).result
  end

  def query_count
    count = @query.except(:select, :limit, :offset).count
    count = count.length if count.is_a?(Hash)
    count
  end
end
