class ApiMaker::CollectionSerializer
  def initialize(ability: nil, args: {}, collection:, include_param:)
    @ability = ability
    @args = args
    @collection = collection
    @include_param = include_param
  end

  def result
    @result ||= begin
      data = {
        data: {},
        included: {}
      }

      ApiMaker::Configuration.profile("CollectionSerializer result collection map") do
        @collection.map do |model|
          data.fetch(:data)[model.model_name.collection] ||= {}
          data.fetch(:data)[model.model_name.collection][model.id] ||= ApiMaker::Serializer.new(ability: @ability, args: @args, model: model)
        end
      end

      preload_collection(data) if @collection.positive?

      data
    end
  end

  def as_json(options = nil)
    result.as_json(options)
  end

  def preload_collection(data)
    ApiMaker::Configuration.profile("CollectionSerializer result preloading") do
      preloader = ApiMaker::Preloader.new(ability: @ability, args: @args, collection: @collection, data: data, include_param: @include_param)
      preloader.fill_data
    end
  end

  def to_json(options = nil)
    JSON.generate(as_json(options))
  end
end
