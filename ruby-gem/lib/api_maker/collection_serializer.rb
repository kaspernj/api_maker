class ApiMaker::CollectionSerializer
  attr_reader :ability, :args, :collection, :locals, :preload_param, :query_params, :select, :select_columns

  def initialize(ability: nil, args: {}, collection:, locals: nil, model_class: nil, query_params: nil)
    raise "No collection was given" unless collection

    @query_params = query_params || {}
    @ability = ability || ApiMaker::Ability.new(args: args)
    @args = args
    @collection = collection
    @locals = locals || args[:locals] || {}
    @preload_param = @query_params[:preload]
    @model_class = model_class
    @select = ApiMaker::SelectParser.execute!(select: query_params[:select]) if @query_params[:select]
    @select_columns = @query_params[:select_columns]
  end

  def result
    @result ||= begin
      data = {
        data: {},
        preloaded: {}
      }

      records = {}
      parsed_collection.map do |model|
        add_model_to_records(model, data, records)
      end

      preload_collection(data, records) if parsed_collection.length.positive?
      load_abilities(data) if query_params[:abilities]

      data
    end
  end

  def load_abilities(data)
    data.fetch(:preloaded).each_value do |models|
      next if models.empty?

      serializers = models.values
      serializer = models.values.first
      abilities = query_params.dig(:abilities, serializer.resource.require_name)

      ApiMaker::AbilitiesLoader.execute!(abilities: abilities, ability: ability, serializers: serializers) if abilities && serializers
    end
  end

  def add_model_to_records(model, data, records)
    serializer = serializer_for_model(model)
    resource = serializer.resource
    collection_name = resource.collection_name
    records[collection_name] ||= {}

    if model.new_record?
      id = "new-#{records.fetch(collection_name).length}"
    else
      id = ApiMaker::PrimaryIdForModel.get(model)
    end

    data.fetch(:preloaded)[collection_name] ||= {}
    data.fetch(:preloaded)[collection_name][id] ||= serializer

    data.fetch(:data)[collection_name] ||= []
    data.fetch(:data)[collection_name] << id

    records[collection_name][id] ||= serializer
  end

  def as_json(options = nil)
    result.as_json(options)
  end

  def model_class
    @model_class ||= if collection.is_a?(Array)
      collection.first.class
    else
      resource.model_class
    end
  end

  def resource
    @resource ||= if collection.is_a?(Array)
      ApiMaker::MemoryStorage.current.resource_for_model(collection.first.class)
    else
      ApiMaker::MemoryStorage.current.resource_for_model(collection.klass)
    end
  end

  def parsed_collection
    @parsed_collection ||= begin
      new_collection = ApiMaker::SelectColumnsOnCollection.execute!(collection: collection, model_class: model_class, select_columns: select_columns)
      new_collection = new_collection.fix if !new_collection.is_a?(Array) && ApiMaker::DatabaseType.postgres?
      new_collection
    end
  end

  def preload_collection(data, records)
    preloader = ApiMaker::Preloader.new(
      ability: ability,
      args: args,
      collection: parsed_collection,
      data: data,
      locals: locals,
      preload_param: preload_param,
      model_class: model_class,
      records: records,
      select: select,
      select_columns: select_columns
    )
    preloader.fill_data
  end

  def select_for(model)
    select&.dig(model.class)
  end

  def serializer_for_model(model)
    ApiMaker::Serializer.new(ability: ability, args: args, locals: locals, model: model, select: select_for(model))
  end

  def to_json(options = nil)
    JSON.generate(as_json(options))
  end
end
