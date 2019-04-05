class ApiMaker::ResultParser
  def self.parse(object)
    ApiMaker::ResultParser.new(object).result
  end

  def initialize(object)
    @object = object
  end

  def result
    parse_object(@object)
  end

private

  def parse_object(object)
    class_name = object.class.name

    if object.is_a?(Hash)
      result = {}
      object.each do |key, value|
        result[key] = parse_object(value)
      end

      result
    elsif object.is_a?(Array)
      object.map { |value| parse_object(value) }
    elsif object.class.name == "Money"
      {amount: object.cents, currency: object.currency.iso_code, type: :money}
    elsif object.is_a?(Date)
      object.iso8601
    elsif object.is_a?(Time)
      object.utc.iso8601
    elsif object.is_a?(ApiMaker::CollectionSerializer) || object.is_a?(ApiMaker::Serializer)
      parse_object(object.as_json)
    else
      object
    end
  end
end
