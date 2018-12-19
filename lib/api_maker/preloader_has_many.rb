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

      if @reflection.is_a?(ActiveRecord::Reflection::ThroughReflection)
        query = query
          .select(@reflection.klass.arel_table[Arel.star])
          .select(@reflection.active_record.arel_table[@reflection.active_record.primary_key].as("api_maker_origin_id"))
      else
        query = query
          .select(@reflection.klass.arel_table[Arel.star])
          .select(@reflection.klass.arel_table[@reflection.foreign_key].as("api_maker_origin_id"))
      end

      query
    end.call
  end

  def ids_query
    @ids_query ||= proc do
      if @reflection.is_a?(ActiveRecord::Reflection::ThroughReflection)
        query = ApiMaker::PreloaderThrough.new(collection: @collection, reflection: @reflection).models_query_through_reflection
      else
        query = @reflection.klass.where(@reflection.foreign_key => @collection.map(&:id))
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

    puts "PluralName: #{plural_name}"
    puts "OriginID: #{origin_id}"

    origin_data = @records.find { |record| puts "Record: #{record.fetch(:type)}(#{record.fetch(:id)})"; record.fetch(:type) == plural_name && record.fetch(:id) == origin_id }

    puts "OriginData: #{origin_data}"

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
