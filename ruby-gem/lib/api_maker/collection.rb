class ApiMaker::Collection
  attr_reader :preload, :ransack, :resource_class, :search

  def initialize(preload:, ransack:, resource_class:, search:)
    @resource_class = resource_class
    @preload = preload
    @ransack = ransack
    @search = search
  end

  def query
    query = resource_class.model_class.ransack(ransack).result

    if search
      search_ransack_params = ApiMaker::SearchToRansackParams.new(search: search).perform
      query = query.ransack(search_ransack_params).result
    end

    query
  end

  def query_params
    {
      preload: preload,
      ransack: ransack,
      search: search
    }
  end
end
