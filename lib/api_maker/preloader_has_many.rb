class ApiMaker::PreloaderHasMany < ApiMaker::PreloaderBase
  def preload
    models.each do |model|
      preload_model(model)
    end

    models
  end

private

  def preload_model(model)
    origin_data = find_origin_data_for_model(model)

    origin_data.fetch(:r)[reflection.name] ||= []
    origin_data.fetch(:r).fetch(reflection.name) << model.id

    serializer = ApiMaker::Serializer.new(ability: ability, args: args, model: model, select: select&.dig(model.class))
    collection_name = serializer.resource.collection_name

    data.fetch(:included)[collection_name] ||= {}
    data.fetch(:included).fetch(collection_name)[model.id] ||= serializer
  end

  def find_origin_data_for_model(model)
    origin_id = model[:api_maker_origin_id]
    origin_data = records.fetch(collection_name).fetch(origin_id)

    raise "Couldn't find any origin data by that type (#{collection_name}) and ID (#{origin_id})" unless origin_data

    origin_data
  end
end
