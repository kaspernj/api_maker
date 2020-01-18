class ApiMaker::PreloaderHasMany
  def initialize(ability:, args:, data:, collection:, reflection:, records:, select:)
    @ability = ability
    @args = args
    @data = data
    @collection = collection
    @reflection = reflection
    @records = records
    @select = select

    raise "No inverse of for #{@reflection.active_record.name}##{@reflection.name}" unless @reflection.inverse_of
  end

  def preload
    models.each do |model|
      preload_model(model)
    end

    models
  end

private

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

  def collection_name
    @collection_name ||= ApiMaker::MemoryStorage.current.resource_for_model(@reflection.active_record).collection_name
  end

  def preload_model(model)
    origin_data = find_origin_data_for_model(model)

    origin_data.fetch(:r)[@reflection.name] ||= []
    origin_data.fetch(:r).fetch(@reflection.name) << model.id

    serializer = ApiMaker::Serializer.new(ability: @ability, args: @args, model: model, select: @select&.dig(model.class))
    collection_name = serializer.resource.collection_name

    @data.fetch(:included)[collection_name] ||= {}
    @data.fetch(:included).fetch(collection_name)[model.id] ||= serializer
  end

  def find_origin_data_for_model(model)
    origin_id = model.read_attribute("api_maker_origin_id")
    origin_data = @records.fetch(collection_name).fetch(origin_id)

    raise "Couldn't find any origin data by that type (#{collection_name}) and ID (#{origin_id})" unless origin_data

    origin_data
  end
end
