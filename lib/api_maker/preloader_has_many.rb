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
      # Group them by subquery to fix Postgres grouping-select issues
      query = @reflection.klass.where(@reflection.klass.primary_key => ids_query)

      query = query
        .distinct
        .joins(@reflection.inverse_of.name)
        .select(@reflection.klass.arel_table[Arel.star])
        .select(@reflection.active_record.arel_table[@reflection.active_record.primary_key].as("api_maker_origin_id"))

      query
    end.call
  end

  def ids_query
    @ids_query ||= proc do
      if @reflection.is_a?(ActiveRecord::Reflection::ThroughReflection)
        query = ApiMaker::PreloaderThrough.new(collection: @collection, reflection: @reflection).models_query_through_reflection
      else
        primary_key_column = @reflection.options[:primary_key]&.to_sym || @collection.primary_key.to_sym
        query = @reflection.klass.where(@reflection.foreign_key => @collection.map(&primary_key_column))
      end

      query = query.accessible_by(@ability) if @ability
      query
    end.call
  end

  def plural_name
    @plural_name ||= @reflection.active_record.model_name.plural
  end

  def klass_plural
    @klass_plural ||= @reflection.klass.model_name.plural
  end

  def preload_model(model)
    origin_id = model.attributes.fetch("api_maker_origin_id")

    origin_data = @records.find do |record|
      record.fetch(:type) == plural_name && record.fetch(:id) == origin_id
    end

    origin_data.fetch(:relationships)[@reflection.name] ||= {data: []}
    origin_data.fetch(:relationships)[@reflection.name].fetch(:data) << {
      type: @reflection.klass.model_name.plural,
      id: model.id
    }

    exists = @data.fetch(:included).find { |record| record.fetch(:type) == klass_plural && record.fetch(:id) == model.id }
    return if exists

    serialized = ApiMaker::Serializer.new(ability: @ability, args: @args, model: model)
    @data.fetch(:included) << serialized
  end
end
