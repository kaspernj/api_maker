class ApiMaker::PreloaderBelongsTo
  def initialize(ability:, args:, data:, collection:, records:, reflection:)
    @ability = ability
    @args = args
    @data = data
    @collection = collection
    @reflection = reflection
    @reflection_name = @reflection.name
    @records = records
  end

  def preload
    models.each do |model|
      records_for_model(model).each do |record|
        record.relationships[@reflection_name] = model.id
      end

      serializer = ApiMaker::Configuration.profile("Preloading #{model.class.name}##{model.id} - serializer") do
        ApiMaker::Serializer.new(ability: @ability, args: @args, model: model)
      end

      @data.fetch(:included)[model.model_name.collection] ||= {}
      @data.fetch(:included).fetch(model.model_name.collection)[model.id] ||= serializer
    end

    {collection: models}
  end

private

  def models
    @models ||= begin
      models = @reflection.klass.where(look_up_key => @collection.map(&@reflection.foreign_key.to_sym).uniq)
      models = models.accessible_by(@ability) if @ability
      models.load
      models
    end
  end

  def look_up_key
    @look_up_key ||= @reflection.options[:primary_key] || @reflection.klass.primary_key
  end

  def plural_name
    @plural_name ||= @reflection.klass.model_name.plural
  end

  def records_for_model(model)
    if @records.is_a?(Hash)
      @records
        .fetch(@reflection.active_record.model_name.collection)
        .values
        .select { |record| record.model.read_attribute(@reflection.foreign_key) == model.read_attribute(look_up_key) }
    else
      @records.select do |record|
        record.model.class.name == @reflection.active_record.name &&
          record.model.read_attribute(@reflection.foreign_key) == model.read_attribute(look_up_key)
      end
    end
  end
end
