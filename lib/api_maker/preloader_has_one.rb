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

      current_reflection = @reflection
      while current_reflection.options[:through].present?
        inverse_of = current_reflection.inverse_of || current_reflection.options.fetch(:through)
        target_reflection = current_reflection.active_record.reflections.fetch(inverse_of.to_s)

        if target_reflection.is_a?(ActiveRecord::Reflection::BelongsToReflection)
          query = query.joins("LEFT JOIN #{target_reflection.table_name} ON #{target_reflection.table_name}.#{target_reflection.klass.primary_key} = #{target_reflection.active_record.table_name}.#{target_reflection.foreign_key}")
        else
          raise "Unknown class: #{target_reflection.class.name}"
        end

        current_reflection = current_reflection.through_reflection.klass.reflections.fetch(@reflection.name.to_s)
      end

      query.joins("LEFT JOIN #{@collection.table_name} ON #{@collection.table_name}.#{@collection.primary_key} = (#{@collection.to_sql})")
    else
      @reflection.klass.where(@reflection.foreign_key => @collection.map(&:id))
    end
  end
end
