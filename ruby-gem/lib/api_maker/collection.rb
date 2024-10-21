class ApiMaker::Collection
  attr_reader :query_params, :resource_class

  ALLOWED_QUERY_PARAMS = {
    abilities: true,
    limit: true,
    page: true,
    page_key: true,
    per: true,
    per_key: true,
    preload: true,
    ransack: true,
    search: true,
    search_key: true,
    select: true
  }.freeze

  def initialize(query_params:, resource_class:)
    @resource_class = resource_class
    @query_params = query_params

    query_params.each_key do |key|
      Rails.logger.error "ApiMaker / Collection: Invalid query param: #{key}" unless ALLOWED_QUERY_PARAMS.key?(key)
    end
  end

  def query
    query = resource_class.model_class.ransack(ransack).result

    if search
      search_ransack_params = ApiMaker::SearchToRansackParams.new(search:).perform
      query = query.ransack(search_ransack_params).result
    end

    query = ApiMaker::Paginate.execute!(page: page.to_i, per_page: per, query:) if page.present?
    query = query.limit(limit) if limit.present?
    query
  end

  def limit
    @query_params[:limit]
  end

  def page
    @query_params[:page]
  end

  def per
    @query_params[:per]
  end

  def preload
    @query_params[:preload]
  end

  def ransack
    @query_params[:ransack]
  end

  def search
    @query_params[:search]
  end

  def select
    @query_params[:select]
  end
end
