class ApiMaker::PreloaderBelongsTo
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

    {collection: models}
  end

private

  def collection_name
    @collection_name = resource.collection_name
  end

  def model_class
    @model_class ||= @reflection.klass
  end

  def models
    @models ||= begin
      @ability.loader.load_resource(resource)

      models = @reflection.klass.where(look_up_key => @collection.map(&@reflection.foreign_key.to_sym).uniq)
      models = models.accessible_by(@ability) if @ability
      models.load
      models
    end
  end

  def look_up_key
    @look_up_key ||= @reflection.options[:primary_key] || @reflection.klass.primary_key
  end

  def records_for_model(model)
    @records
      .fetch(collection_name)
      .values
      .select { |record| record.model.read_attribute(@reflection.foreign_key) == model.read_attribute(look_up_key) }
  end

  def resource
    @resource ||= ApiMaker::MemoryStorage
      .current
      .resource_for_model(@reflection.active_record)
  end
end
