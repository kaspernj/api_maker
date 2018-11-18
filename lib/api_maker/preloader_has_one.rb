class ApiMaker::PreloaderHasOne
  def initialize(ability:, data:, collection:, reflection:, records:)
    @data = data
    @collection = collection
    @reflection = reflection
    @records = records
  end

  def preload
    plural_name = @reflection.active_record.model_name.plural

    puts "SQL: #{models.to_sql}"

    models.find_each do |model|
      origin_id = model.attributes.fetch(@reflection.foreign_key)
      origin_data = @records.find { |record| record.fetch(:type) == plural_name && record.fetch(:id) == origin_id }

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
      query = @reflection.klass.where("#{@reflection.through_reflection.klass.table_name}.#{@reflection.through_reflection.klass.primary_key}" => @collection.map(&:id))

      joins = []

      current_reflection = @reflection
      while current_reflection.is_a?(ActiveRecord::Reflection::ThroughReflection)
        # binding.pry

        if current_reflection.through_reflection.is_a?(ActiveRecord::Reflection::BelongsToReflection)
          inverse_of = current_reflection.through_reflection.plural_name.to_sym
          joins << inverse_of
        else
          raise "Unknown class: #{current_reflection.through_reflection.class.name}"
        end

        current_reflection = current_reflection.through_reflection.klass.reflections.fetch(@reflection.name.to_s)
      end

      last_reflection = @reflection.through_reflection.inverse_of

      joins.prepend(last_reflection.plural_name.to_sym)
      joins_hash = joins_array_to_hash(joins)

      puts "JOINS: #{joins}"
      puts "HASH: #{joins_hash}"

      inverse_of = @reflection.inverse_of || @reflection.options[:through].to_s.pluralize.to_sym
      query = query.joins(joins_hash).where("#{last_reflection.table_name}.#{last_reflection.klass.primary_key} = (?)", @collection.map(&:id))

      puts "SQL: #{query.to_sql}"

      # binding.pry

      query
    else
      @reflection.klass.where(@reflection.foreign_key => @collection.map(&:id))
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
