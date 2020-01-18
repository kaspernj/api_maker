class ApiMaker::PreloaderHasOne
  def initialize(ability:, args:, data:, collection:, reflection:, records:, select: @select)
    @ability = ability
    @args = args
    @data = data
    @collection = collection
    @reflection = reflection
    @records = records
    @select = select

    raise "Records was nil" unless records
  end

  def collection_name
    @collection_name ||= ApiMaker::MemoryStorage.current.resource_for_model(@reflection.active_record).collection_name
  end

  def preload
    models.each do |model|
      ApiMaker::Configuration.profile("Preloading #{model.class.name}##{model.id}") do
        origin_data = origin_data_for_model(model)
        origin_data.fetch(:r)[@reflection.name] = model.id

        serializer = ApiMaker::Serializer.new(ability: @ability, args: @args, model: model, select: @select&.dig(model.class))
        collection_name = serializer.resource.collection_name

        @data.fetch(:included)[collection_name] ||= {}
        @data.fetch(:included).fetch(collection_name)[model.id] ||= serializer
      end
    end

    models
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

  def origin_data_for_model(model)
    origin_id = model.read_attribute("api_maker_origin_id")
    @data.fetch(:included).fetch(collection_name).fetch(origin_id)
  end

  def resource
    @resource ||= ApiMaker::MemoryStorage.current.resource_for_model(@reflection.klass)
  end
end
