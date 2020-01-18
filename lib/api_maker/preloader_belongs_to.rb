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

    models
  end

private

  def collection_name
    @collection_name = ApiMaker::MemoryStorage.current.resource_for_model(@reflection.active_record).collection_name
  end

  def collection_ids
    @collection_ids ||= @collection.map do |collection_model|
      collection_model.read_attribute(@reflection.active_record.primary_key)
    end
  end

  def models
    @models ||= begin
      accessible_query = @reflection.klass.accessible_by(@ability)

      join_query = @reflection.active_record
        .select(@reflection.klass.arel_table[Arel.star])
        .select(@reflection.active_record.arel_table[@reflection.active_record.primary_key].as("api_maker_origin_id"))
        .joins(@reflection.name)
        .where(@reflection.active_record.primary_key => collection_ids)
        .where(@reflection.klass.table_name => {@reflection.klass.primary_key => accessible_query})

      @reflection.klass.find_by_sql(join_query.to_sql)
    end
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
