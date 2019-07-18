class ApiMaker::CollectionSerializer
  def initialize(ability: nil, args: {}, collection:, include_param:, select: nil)
    @ability = ability || ApiMaker::Ability.new(args: args)
    @args = args
    @collection = collection
    @include_param = include_param
    @select = select
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
          serializer = ApiMaker::Serializer.new(ability: @ability, args: @args, model: model, select: select_for(model))
          resource = serializer.resource
          collection_name = resource.collection_name
          id = model.id

          data.fetch(:included)[collection_name] ||= {}
          data.fetch(:included)[collection_name][id] ||= serializer

          data.fetch(:data)[collection_name] ||= []
          data.fetch(:data)[collection_name] << id

          records[collection_name] ||= {}
          records[collection_name][id] ||= serializer
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
      preloader = ApiMaker::Preloader.new(
        ability: @ability,
        args: @args,
        collection: @collection,
        data: data,
        include_param: @include_param,
        records: records,
        select: @select
      )
      preloader.fill_data
    end
  end

  def select_for(model)
    @select&.dig(model.class)
  end

  def to_json(options = nil)
    JSON.generate(as_json(options))
  end
end
