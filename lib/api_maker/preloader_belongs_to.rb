class ApiMaker::PreloaderBelongsTo
  def initialize(ability:, data:, collection:, records:, reflection:)
    @data = data
    @collection = collection
    @reflection = reflection
    @records = records
  end

  def preload
    plural_name = @reflection.active_record.model_name.plural
    models = @reflection.klass.where(@reflection.klass.primary_key => @collection.map(&@reflection.foreign_key.to_sym))

    models.each do |model|
      @records.each do |record|
        if record.model.class == @reflection.active_record && record.model.attributes.fetch(@reflection.foreign_key) == model.id
          record.relationships[@reflection.name] = {data: {
            type: @reflection.klass.model_name.plural,
            id: model.id
          }}
        end
      end

      serialized = ApiMaker::Serializer.new(model: model)

      @data.fetch(:included) << serialized
    end

    {collection: models}
  end
end
