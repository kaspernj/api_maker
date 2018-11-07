class ApiMaker::CollectionSerializer
  def initialize(ability: nil, args: {}, collection:, include_param:)
    @ability = ability
    @args = args
    @collection = collection
    @include_param = include_param
  end

  def result
    @collection.map do |model|
      ApiMaker::Serializer.new(ability: @ability, args: @args, model: model, include_param: @include_param).result
    end
  end
end
