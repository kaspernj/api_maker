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

  def preload
    plural_name = @reflection.klass.model_name.plural

    models.each do |model|
      origin_id = model.attributes.fetch("api_maker_origin_id")
      origin_data = @records.find { |record| record.model.class == @reflection.active_record && record.model.id == origin_id }

      origin_data.fetch(:relationships)[@reflection.name] = {data: {
        type: plural_name,
        id: model.id
      }}

      exists = @data.fetch(:included).find { |record| record.fetch(:type) == plural_name && record.fetch(:id) == model.id }
      next if exists

      serialized = ApiMaker::Serializer.new(ability: @ability, args: @args, model: model)
      @data.fetch(:included) << serialized
    end

    {collection: models}
  end

  def models
    @models ||= proc do
      if @reflection.is_a?(ActiveRecord::Reflection::ThroughReflection)
        query = ApiMaker::PreloaderThrough.new(collection: @collection, reflection: @reflection).models_query_through_reflection
      else
        query = @reflection.klass.where(@reflection.foreign_key => @collection.map(&:id))
        query = query.select(@reflection.klass.arel_table[Arel.star]).select(@reflection.klass.arel_table[@reflection.foreign_key].as("api_maker_origin_id"))
      end

      query = query.accessible_by(@ability) if @ability
      query = query.group(@reflection.klass.arel_table[@reflection.klass.primary_key]).fix # Group by ID
      query
    end.call
  end
end
