class ApiMaker::PreloaderHasOne
  def initialize(ability:, args:, data:, collection:, reflection:, records:)
    @ability = ability
    @args = args
    @data = data
    @collection = collection
    @reflection = reflection
    @records = records

    raise "Records was nil" unless records
  end

  def collection_name
    @collection_name ||= ApiMaker::MemoryStorage.current.resource_for_model(@reflection.active_record).collection_name
  end

  def preload
    models.each do |model|
      ApiMaker::Configuration.profile("Preloading #{model.class.name}##{model.id}") do
        origin_data = origin_data_for_model(model)
        origin_data.fetch(:relationships)[@reflection.name] = model.id

        serializer = ApiMaker::Serializer.new(ability: @ability, args: @args, model: model)
        collection_name = serializer.resource.collection_name

        @data.fetch(:included)[collection_name] ||= {}
        @data.fetch(:included).fetch(collection_name)[model.id] ||= serializer
      end
    end

    {collection: models}
  end

  def models
    @models ||= begin
      if @reflection.is_a?(ActiveRecord::Reflection::ThroughReflection)
        query = query_through
      else
        query = query_normal
      end

      query = query.accessible_by(@ability) if @ability
      query = query.fix
      query.load
      query
    end
  end

  def origin_data_for_model(model)
    origin_id = model.read_attribute("api_maker_origin_id")
    @data.fetch(:included).fetch(collection_name).fetch(origin_id)
  end

  def query_through
    ApiMaker::PreloaderThrough.new(collection: @collection, reflection: @reflection).models_query_through_reflection
      .select(@reflection.klass.arel_table[Arel.star])
      .select(@reflection.active_record.arel_table[@reflection.active_record.primary_key].as("api_maker_origin_id"))
  end

  def query_normal
    @reflection.klass.where(@reflection.foreign_key => @collection.map(&:id))
      .select(@reflection.klass.arel_table[Arel.star])
      .select(@reflection.klass.arel_table[@reflection.foreign_key].as("api_maker_origin_id"))
  end
end
