class ApiMaker::PreloaderHasMany
  def initialize(ability:, base_data:, data:, reflection:)
    @base_data = base_data
    @data = data
    @reflection = reflection
  end

  def preload
    puts "Data: #{@data}"

    found_ids = @data.fetch(:data).map { |record| record.fetch(:id) }
    puts "Found IDS: #{found_ids}"

    models = @reflection.klass.where(@reflection.klass.primary_key => found_ids)

    models.each do |model|
      origin_id = model.attributes.fetch(@reflection.foreign_key)
      origin_data = @data.fetch(:data).find { |record| record.fetch(:id) == origin_id }

      origin_data.fetch(:relationships)[@reflection.name] ||= {data: []}
      origin_data.fetch(:relationships)[@reflection.name].fetch(:data) << {
        type: @reflection.klass.model_name.plural,
        id: model.id
      }

      serialized = ApiMaker::Serializer.new(model: model).result

      @base_data.fetch(:included) << serialized
    end

    puts "Models: #{models.to_a}"
    puts "Data: #{@data}"

    raise "stub"
  end
end
