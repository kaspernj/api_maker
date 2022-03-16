class ApiMaker::Collection
  attr_reader :preload, :ransack

  def initialize(preload:, ransack:)
    @preload = preload
    @ransack = ransack
  end

  def query_params
    {
      preload: preload,
      ransack: ransack
    }
  end
end
