class ApiMaker::Collection
  attr_reader :query_params, :resource_class

  def initialize(query_params:, resource_class:)
    @resource_class = resource_class
    @query_params = query_params
  end

  def query
    query = resource_class.model_class.ransack(ransack).result

    if search
      search_ransack_params = ApiMaker::SearchToRansackParams.new(search:).perform
      query = query.ransack(search_ransack_params).result
    end

    query
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
