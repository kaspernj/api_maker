class ApiMaker::PreloaderHasOne
  def initialize(ability:, data:, collection:, reflection:, records:)
    @data = data
    @collection = collection
    @reflection = reflection
    @records = records

    raise "Records was nil" unless records
  end

  def preload
    plural_name = @reflection.active_record.model_name.plural

    models.find_each do |model|
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
    if @reflection.is_a?(ActiveRecord::Reflection::ThroughReflection)
      joins = []

      current_reflection = @reflection
      while current_reflection.is_a?(ActiveRecord::Reflection::ThroughReflection)
        if current_reflection.__send__(:delegate_reflection).is_a?(ActiveRecord::Reflection::HasOneReflection)
          inverse_of = current_reflection.through_reflection.name
          joins << inverse_of
        elsif current_reflection.through_reflection.is_a?(ActiveRecord::Reflection::BelongsToReflection)
          inverse_of = current_reflection.through_reflection.plural_name.to_sym
          joins << inverse_of
        else
          raise "Unknown class: #{current_reflection.through_reflection.class.name}"
        end

        current_reflection = current_reflection.through_reflection.klass.reflections.fetch(@reflection.name.to_s)
      end

      last_reflection = @reflection.through_reflection.inverse_of

      if last_reflection
        table_name = last_reflection.table_name
        primary_key = last_reflection.klass.primary_key
        joins.prepend(last_reflection.plural_name.to_sym)
      else
        table_name = @reflection.through_reflection.active_record.model_name.plural
        primary_key = @reflection.through_reflection.active_record.primary_key
        joins.prepend(table_name.to_sym)
      end

      joins_hash = joins_array_to_hash(joins)
      inverse_of = @reflection.inverse_of || @reflection.options[:through].to_s.pluralize.to_sym
      query = @reflection.klass.joins(joins_hash).where(table_name => {primary_key => @collection.map(&:id)})
      query.select(@reflection.klass.arel_table[Arel.star]).select(@reflection.active_record.arel_table[:id].as("api_maker_origin_id"))
    else
      query = @reflection.klass.where(@reflection.foreign_key => @collection.map(&:id))
      query.select(@reflection.klass.arel_table[Arel.star]).select(@reflection.klass.arel_table[@reflection.foreign_key].as("api_maker_origin_id"))
    end
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
