class ApiMaker::PreloaderBelongsTo
  def initialize(ability:, data:, reflection:)
    @data = data
    @reflection = reflection
  end

  def preload
    raise "stub"
  end
end
