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
        next unless record.model.attributes.fetch(@reflection.foreign_key) == model.attributes.fetch(look_up_key)

        record.relationships[@reflection.name] = {data: {
          type: plural_name,
          id: model.id
        }}
      end

      exists = @data.fetch(:included).find { |record| record.fetch(:type) == plural_name && record.fetch(:id) == model.attributes.fetch(look_up_key) }
      next if exists

      serialized = ApiMaker::Serializer.new(ability: @ability, args: @args, model: model)
      @data.fetch(:included) << serialized
    end

    {collection: models}
  end

private

  def models
    models = @reflection.klass.where(look_up_key => @collection.map(&@reflection.foreign_key.to_sym))
    models = models.accessible_by(@ability) if @ability
    models
  end

  def look_up_key
    @look_up_key ||= @reflection.options[:primary_key] || @reflection.klass.primary_key
  end

  def plural_name
    @plural_name ||= @reflection.klass.model_name.plural
  end
end
