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

      @collection.map do |model|
        data.fetch(:data)[model.model_name.collection] ||= {}
        data.fetch(:data)[model.model_name.collection][model.id] ||= ApiMaker::Serializer.new(ability: @ability, args: @args, model: model)
      end

      preloader = ApiMaker::Preloader.new(ability: @ability, args: @args, collection: @collection, data: data, include_param: @include_param)
      preloader.fill_data

      data
    end
  end

  def as_json(options = nil)
    result.as_json(options)
  end

  def to_json(options = nil)
    JSON.generate(as_json)
  end
end
