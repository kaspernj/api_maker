class ApiMaker::Collection
  attr_reader :preload, :ransack, :resource_class

  def initialize(preload:, ransack:, resource_class:)
    @resource_class = resource_class
    @preload = preload
    @ransack = ransack
  end

  def query
    resource_class.model_class.ransack(ransack).result
  end

  def query_params
    {
      preload: preload,
      ransack: ransack
    }
  end
end
