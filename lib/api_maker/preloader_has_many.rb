class ApiMaker::PreloaderHasMany
  def initialize(ability:, args:, data:, collection:, reflection:, records:)
    @ability = ability
    @args = args
    @data = data
    @collection = collection
    @reflection = reflection
    @records = records
  end

  def preload
    models.each do |model|
      preload_model(model)
    end

    {collection: models}
  end

private

  def models
    @models ||= proc do
      if @reflection.is_a?(ActiveRecord::Reflection::ThroughReflection)
        query = ApiMaker::PreloaderThrough.new(collection: @collection, reflection: @reflection).models_query_through_reflection
      else
        query = @reflection.klass.where(@reflection.foreign_key => @collection.map(&:id))
        query = query.select(@reflection.klass.arel_table[Arel.star]).select(@reflection.klass.arel_table[@reflection.foreign_key].as("api_maker_origin_id"))
      end

      query = query.group(@reflection.klass.arel_table[@reflection.klass.primary_key]) # Group by ID
      query = query.accessible_by(@ability) if @ability
      query
    end.call
  end

  def plural_name
    @plural_name ||= @reflection.active_record.model_name.plural
  end

  def preload_model(model)
    origin_id = model.attributes.fetch("api_maker_origin_id")

    origin_data = @records.find { |record| record.fetch(:type) == plural_name && record.fetch(:id) == origin_id }
    origin_data.fetch(:relationships)[@reflection.name] ||= {data: []}
    origin_data.fetch(:relationships)[@reflection.name].fetch(:data) << {
      type: @reflection.klass.model_name.plural,
      id: model.id
    }

    serialized = ApiMaker::Serializer.new(ability: @ability, args: @args, model: model)

    @data.fetch(:included) << serialized
  end
end
