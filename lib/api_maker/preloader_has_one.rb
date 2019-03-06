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

  def klass_plural
    @klass_plural ||= @reflection.klass.model_name.plural
  end

  def preload
    plural_name = @reflection.klass.model_name.plural

    models.each do |model|
      origin_id = model.attributes.fetch("api_maker_origin_id")
      origin_data = @records.find { |record| record.model.class == @reflection.active_record && record.model.id == origin_id }

      origin_data.fetch(:relationships)[@reflection.name] = {data: {
        type: plural_name,
        id: model.id
      }}

      exists = @data.fetch(:included).find { |record| record.fetch(:type) == klass_plural && record.fetch(:id) == model.id }
      next if exists

      serialized = ApiMaker::Serializer.new(ability: @ability, args: @args, model: model)
      @data.fetch(:included) << serialized
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
      query
    end
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
