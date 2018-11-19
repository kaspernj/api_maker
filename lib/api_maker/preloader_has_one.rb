class ApiMaker::PreloaderHasOne
  def initialize(ability:, data:, collection:, reflection:, records:)
    @ability = ability
    @data = data
    @collection = collection
    @reflection = reflection
    @records = records

    raise "Records was nil" unless records
  end

  def preload
    models.each do |model|
      origin_id = model.attributes.fetch("api_maker_origin_id")
      origin_data = @records.find { |record| record.model.class == @reflection.active_record && record.model.id == origin_id }

      origin_data.fetch(:relationships)[@reflection.name] = {data: {
        type: @reflection.klass.model_name.plural,
        id: model.id
      }}

      serialized = ApiMaker::Serializer.new(model: model)

      @data.fetch(:included) << serialized
    end

    {collection: models}
  end

  def models
    @models ||= proc do
      if @reflection.is_a?(ActiveRecord::Reflection::ThroughReflection)
        query = models_query_through_reflection
      else
        query = @reflection.klass.where(@reflection.foreign_key => @collection.map(&:id))
        query = query.select(@reflection.klass.arel_table[Arel.star]).select(@reflection.klass.arel_table[@reflection.foreign_key].as("api_maker_origin_id"))
      end

      query = query.accessible_by(@ability) if @ability
      query
    end.call
  end

  def models_query_through_reflection
    last_reflection = @reflection.through_reflection.inverse_of

    if last_reflection
      table_name = last_reflection.table_name
      primary_key = last_reflection.klass.primary_key
    else
      table_name = @reflection.through_reflection.active_record.model_name.plural
      primary_key = @reflection.through_reflection.active_record.primary_key
    end

    joins_hash = joins_array_to_hash(joins_for_reflection(@reflection))

    @reflection.klass.joins(joins_hash)
      .where(table_name => {primary_key => @collection.map(&:id)})
      .select(@reflection.klass.arel_table[Arel.star])
      .select(@reflection.active_record.arel_table[@reflection.active_record.primary_key].as("api_maker_origin_id"))
  end

  def joins_for_reflection(current_reflection)
    joins = []

    loop do
      macro = current_reflection.macro

      if current_reflection.through_reflection.__send__(:inverse_name)
        joins << current_reflection.through_reflection.__send__(:inverse_name)
      elsif macro == :has_many
        joins << current_reflection.through_reflection.name
      elsif macro == :belongs_to || macro == :has_one
        joins << current_reflection.through_reflection.plural_name.to_sym
      else
        raise "Unknown class: #{current_reflection.through_reflection.class.name}"
      end

      current_reflection = current_reflection.through_reflection.klass.reflections.fetch(@reflection.name.to_s)

      unless current_reflection.is_a?(ActiveRecord::Reflection::ThroughReflection)
        joins << current_reflection.__send__(:inverse_name)
        break
      end
    end

    joins
  end

  def joins_array_to_hash(array)
    array = array.clone

    result = {}
    work_result = result

    while array.any?
      element = array.pop

      if array.length == 1
        work_result[element] = array.pop
      else
        work_result[element] = {}
      end

      work_result = work_result[element]
    end

    result
  end
end
