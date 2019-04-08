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

      records = {}

      ApiMaker::Configuration.profile("CollectionSerializer result collection map") do
        @collection.map do |model|
          serializer = ApiMaker::Serializer.new(ability: @ability, args: @args, model: model)
          resource = serializer.resource
          collection_name = resource.collection_name

          data.fetch(:included)[collection_name] ||= {}
          data.fetch(:included)[collection_name][model.id] ||= serializer

          data.fetch(:data)[collection_name] ||= []
          data.fetch(:data)[collection_name] << model.id

          records[collection_name] ||= {}
          records[collection_name][model.id] = serializer
        end
      end

      preload_collection(data, records) if @collection.length.positive?

      data
    end
  end

  def as_json(options = nil)
    result.as_json(options)
  end

  def preload_collection(data, records)
    ApiMaker::Configuration.profile("CollectionSerializer result preloading") do
      preloader = ApiMaker::Preloader.new(ability: @ability, args: @args, collection: @collection, data: data, include_param: @include_param, records: records)
      preloader.fill_data
    end
  end

  def to_json(options = nil)
    JSON.generate(as_json(options))
  end
end
