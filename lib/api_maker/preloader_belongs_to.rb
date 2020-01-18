class ApiMaker::PreloaderBelongsTo < ApiMaker::PreloaderBase
  def initialize(ability:, args:, data:, collection:, records:, reflection:, select:)
    @ability = ability
    @args = args
    @data = data
    @collection = collection
    @reflection = reflection
    @reflection_name = @reflection.name
    @records = records
    @select = select
  end

  def preload
    models.each do |model|
      records_for_model(model).each do |record|
        record.relationships[@reflection_name] = model.id
      end

      serializer = ApiMaker::Serializer.new(ability: @ability, args: @args, model: model, select: @select&.dig(model.class))
      collection_name = serializer.resource.collection_name

      @data.fetch(:included)[collection_name] ||= {}
      @data.fetch(:included).fetch(collection_name)[model.id] ||= serializer
    end

    models
  end

private

  def collection_name
    @collection_name = ApiMaker::MemoryStorage.current.resource_for_model(@reflection.active_record).collection_name
  end

  def model_class
    @model_class ||= @reflection.klass
  end

  def look_up_key
    @look_up_key ||= @reflection.options[:primary_key] || @reflection.klass.primary_key
  end

  def records_for_model(model)
    # Force to string if one column is an integer and another is a string
    @records
      .fetch(collection_name)
      .values
      .select { |record| record.model.read_attribute(@reflection.foreign_key).to_s == model.read_attribute(look_up_key).to_s }
  end
end
