class ApiMaker::Deserializer < ApiMaker::ApplicationService
  attr_reader :arg

  def initialize(arg:)
    @arg = arg
  end

  def execute
    succeed! deserialize
  end

  def deserialize
    if arg.is_a?(Array)
      arg.map { |value| ApiMaker::Deserializer.execute!(arg: value) }
    elsif arg.is_a?(Hash) || arg.is_a?(ActionController::Parameters)
      if arg["api_maker_type"] == "resource"
        "Resources::#{arg.fetch("name")}Resource".safe_constantize
      elsif arg["api_maker_type"] == "datetime"
        Time.zone.parse(arg.fetch("value"))
      else
        new_hash = arg.class.new
        arg.each do |key, value|
          deserialized_key = ApiMaker::Deserializer.execute!(arg: key)
          deserialized_value = ApiMaker::Deserializer.execute!(arg: value)

          new_hash[deserialized_key] = deserialized_value
        end

        new_hash
      end
    else
      arg
    end
  end
end
