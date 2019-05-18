class ApiMaker::IndexCommand < ApiMaker::BaseCommand
  attr_reader :params

  def execute!
    ApiMaker::Configuration.profile("IndexCommand execute") do
      each_command do |command|
        @params = command.args || {}

        set_collection

        collection = collection_from_query(@query.fix)

        response = collection.as_json
        include_pagination_data(response, @query)

        command.result(response)
      end
    end
  end

  def filter_custom_accessible_by(collection)
    return collection if params[:accessible_by].blank?
    collection.accessible_by(current_ability, params[:accessible_by].to_sym)
  end

  def collection_from_query(collection)
    ApiMaker::Configuration.profile("IndexCommand collection_from_query") do
      select = parse_select(params[:select]&.permit!&.to_hash) if params[:select]

      ApiMaker::CollectionSerializer.new(
        ability: current_ability,
        args: api_maker_args,
        collection: collection,
        include_param: params[:include],
        select: select
      ).result
    end
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

    model_class = params[:through][:model].safe_constantize
    through_model = model_class.accessible_by(current_ability).find(params[:through][:id])
    association = ActiveRecord::Associations::Association.new(through_model, model_class.reflections.fetch(params[:through][:reflection]))

    query_through = association.scope
    query_through = query_through.accessible_by(current_ability)
    query_through = filter_custom_accessible_by(query_through)
    query_through
  end

  # This converts the list of attributes to a hash that contains the data needed for the serializer (so the serializer doesn't have to do it for each model)
  def parse_select(select)
    new_select = {}

    select.each do |model_collection_name, attributes|
      model_class = model_collection_name.underscore.singularize.camelize.safe_constantize
      resource = ApiMaker::Serializer.resource_for!(model_class)
      new_attributes = resource._attributes.select { |key| attributes.include?(key.to_s) }

      new_select[model_class] = new_attributes
    end

    new_select
  end

  def set_collection
    @query = manage_through_relationship || collection
    @query = @query.ransack(params[:q]).result
    @query = @query.limit(params[:limit]) if params[:limit].present?
    @query = @query.page(params[:page]) if params[:page].present?
    @query = filter_custom_accessible_by(@query)
  end
end
