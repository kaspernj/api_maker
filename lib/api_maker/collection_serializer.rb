class ApiMaker::CollectionSerializer
  def initialize(ability: nil, args: {}, collection:, include_param:)
    @ability = ability
    @args = args
    @collection = collection
    @include_param = include_param
  end

  def result
    @result ||= proc do
      data = {
        data: [],
        included: []
      }

      @collection.map do |model|
        data.fetch(:data) << ApiMaker::Serializer.new(ability: @ability, args: @args, model: model)
      end

      preloader = ApiMaker::Preloader.new(ability: @ability, collection: @collection, data: data, include_param: @include_param)
      preloader.fill_data

      data
    end.call
  end
end
