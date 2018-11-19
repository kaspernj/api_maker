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
      models = @reflection.klass.where(@reflection.foreign_key => @collection.map(&:id))
      models = models.accessible_by(@ability) if @ability
      models
    end.call
  end

  def plural_name
    @plural_name ||= @reflection.active_record.model_name.plural
  end

  def preload_model(model)
    origin_id = model.attributes.fetch(@reflection.foreign_key)
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
