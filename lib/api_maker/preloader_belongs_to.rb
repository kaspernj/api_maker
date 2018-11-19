class ApiMaker::PreloaderBelongsTo
  def initialize(ability:, args:, data:, collection:, records:, reflection:)
    @ability = ability
    @args = args
    @data = data
    @collection = collection
    @reflection = reflection
    @records = records
  end

  def preload
    models.each do |model|
      @records.each do |record|
        next unless record.model.class == @reflection.active_record
        next unless record.model.attributes.fetch(@reflection.foreign_key) == model.id

        record.relationships[@reflection.name] = {data: {
          type: @reflection.klass.model_name.plural,
          id: model.id
        }}
      end

      serialized = ApiMaker::Serializer.new(ability: @ability, args: @args, model: model)

      @data.fetch(:included) << serialized
    end

    {collection: models}
  end

private

  def models
    models = @reflection.klass.where(@reflection.klass.primary_key => @collection.map(&@reflection.foreign_key.to_sym))
    models = models.accessible_by(@ability) if @ability
    models
  end
end
