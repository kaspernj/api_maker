class ApiMaker::PreloaderHasOne < ApiMaker::PreloaderBase
  def preload
    models.each do |model|
      ApiMaker::Configuration.profile("Preloading #{model.class.name}##{model.id}") do
        origin_data = origin_data_for_model(model)
        origin_data.fetch(:r)[reflection.name] = model.id

        serializer = ApiMaker::Serializer.new(ability: ability, args: args, model: model, select: select&.dig(model.class))
        collection_name = serializer.resource.collection_name

        data.fetch(:included)[collection_name] ||= {}
        data.fetch(:included).fetch(collection_name)[model.id] ||= serializer
      end
    end

    models
  end

  def origin_data_for_model(model)
    origin_id = model.read_attribute("api_maker_origin_id")
    data.fetch(:included).fetch(collection_name).fetch(origin_id)
  end
end
