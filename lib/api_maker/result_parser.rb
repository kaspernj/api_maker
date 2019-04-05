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

    case class_name
    when "Hash"
      result = {}
      object.each do |key, value|
        result[key] = parse_object(value)
      end

      result
    when "Array"
      object.map { |value| parse_object(value) }
    when "Money"
      {amount: object.cents, currency: object.currency.iso_code, type: :money}
    when "Date"
      object.iso8601
    when "Time"
      object.utc.iso8601
    else
      object
    end
  end
end
