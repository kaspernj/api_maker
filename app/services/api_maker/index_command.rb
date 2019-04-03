class ApiMaker::IndexCommand < ApiMaker::BaseCommand
  attr_reader :params

  def execute!
    each_command do |command|
      @params = command.args || {}

      set_collection
      @query = filter_custom_accessible_by(@query)

      collection = collection_from_query(@query.fix)

      response = collection.as_json
      include_pagination_data(response, @query)

      command.result(response)
    end
  end

  def filter_custom_accessible_by(collection)
    return collection if params[:accessible_by].blank?
    collection.accessible_by(current_ability, params[:accessible_by].to_sym)
  end

  def collection_from_query(collection)
    ApiMaker::CollectionSerializer.new(ability: current_ability, args: api_maker_args, collection: collection, include_param: params[:include]).result
  end

  def include_pagination_data(response, collection)
    return if params[:page].blank?

    response[:meta] = {
      currentPage: collection.current_page,
      totalCount: collection.try(:total_count) || collection.try(:total_entries),
      totalPages: collection.total_pages
    }
  end

  def manage_through_relationship
    return if params[:through].blank?

    through_model = params[:through][:model].constantize.accessible_by(current_ability).find(params[:through][:id])
    query_through = through_model.__send__(params[:through][:reflection]).accessible_by(current_ability)
    query_through = filter_custom_accessible_by(query_through)
    query_through
  end

  def set_collection
    @query ||= manage_through_relationship || collection
    @query = @query.ransack(params[:q]).result
    @query = @query.limit(params[:limit]) if params[:limit].present?
    @query = @query.page(params[:page]) if params[:page].present?
    @query = filter_custom_accessible_by(@query)
  end
end
