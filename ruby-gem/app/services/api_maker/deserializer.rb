class ApiMaker::Deserializer < ApiMaker::ApplicationService
  attr_reader :arg

  def initialize(arg:)
    @arg = arg
  end

  def perform
    succeed! deserialize
  end

  def deserialize
    if arg.is_a?(Array)
      arg.map { |value| ApiMaker::Deserializer.execute!(arg: value) }
    elsif arg.is_a?(Hash) || arg.is_a?(ActionController::Parameters)
      deserialize_hash(arg)
    else
      arg
    end
  end

  def deserialize_api_maker_collection(arg)
    permitted_arg = arg.permit!.to_h

    ApiMaker::Collection.new(
      preload: ApiMaker::Deserializer.execute!(arg: permitted_arg.fetch("value").fetch("queryArgs")["preload"]),
      ransack: ApiMaker::Deserializer.execute!(arg: permitted_arg.fetch("value").fetch("queryArgs")["ransack"]),
      resource_class: ApiMaker::Deserializer.execute!(arg: permitted_arg.fetch("value").fetch("args").fetch("modelClass")),
      search: ApiMaker::Deserializer.execute!(arg: permitted_arg.fetch("value").fetch("queryArgs")["search"]),
      select: ApiMaker::Deserializer.execute!(arg: permitted_arg.fetch("value").fetch("queryArgs")["select"])
    )
  end

  def deserialize_hash(arg)
    if arg["api_maker_type"] == "collection"
      deserialize_api_maker_collection(arg)
    elsif arg["api_maker_type"] == "model"
      model_class = arg.fetch("model_class_name").safe_constantize
      model_class.find(arg.fetch("model_id"))
    elsif arg["api_maker_type"] == "resource"
      "Resources::#{arg.fetch("name")}Resource".safe_constantize
    elsif arg["api_maker_type"] == "datetime"
      Time.zone.parse(arg.fetch("value"))
    else
      deserialize_normal_hash(arg)
    end
  end

  def deserialize_normal_hash(arg)
    new_hash = arg.class.new
    arg.each do |key, value|
      deserialized_key = ApiMaker::Deserializer.execute!(arg: key)
      deserialized_value = ApiMaker::Deserializer.execute!(arg: value)

      new_hash[deserialized_key] = deserialized_value
    end

    new_hash
  end
end
