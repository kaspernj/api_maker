class ApiMaker::PreloaderHasMany
  def initialize(ability:, data:, collection:, reflection:, records:)
    @data = data
    @collection = collection
    @reflection = reflection
    @records = records
  end

  def preload
    models = @reflection.klass.where(@reflection.foreign_key => @collection.map(&:id))
    plural_name = @reflection.active_record.model_name.plural

    models.find_each do |model|
      origin_id = model.attributes.fetch(@reflection.foreign_key)
      origin_data = @records.find { |record| record.fetch(:type) == plural_name && record.fetch(:id) == origin_id }

      origin_data.fetch(:relationships)[@reflection.name] ||= {data: []}
      origin_data.fetch(:relationships)[@reflection.name].fetch(:data) << {
        type: @reflection.klass.model_name.plural,
        id: model.id
      }

      serialized = ApiMaker::Serializer.new(model: model)

      @data.fetch(:included) << serialized
    end

    {collection: models}
  end
end
