class ApiMaker::PreloaderBelongsTo < ApiMaker::PreloaderBase
  def preload
    models.each do |model|
      model_id = ApiMaker::PrimaryIdForModel.get(model)

      records_for_model(model).each do |record|
        record.relationships[reflection_name] = model_id
      end

      serializer = ApiMaker::Serializer.new(ability: ability, args: args, model: model, select: select&.dig(model.class))
      collection_name = serializer.resource.collection_name

      data.fetch(:included)[collection_name] ||= {}
      data.fetch(:included).fetch(collection_name)[model_id] ||= serializer
    end

    models
  end

private

  def model_class
    @model_class ||= reflection.klass
  end

  def look_up_key
    @look_up_key ||= reflection.options[:primary_key] || reflection.klass.primary_key
  end

  def records_for_model(model)
    # Force to string if one column is an integer and another is a string
    records
      .fetch(collection_name)
      .values
      .select { |record| record.model[reflection.foreign_key].to_s == model[look_up_key].to_s }
  end
end
