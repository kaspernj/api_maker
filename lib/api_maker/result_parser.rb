class ApiMaker::ResultParser
  attr_reader :ability, :args

  def self.parse(*args)
    ApiMaker::ResultParser.new(*args).result
  end

  def initialize(object, ability: nil, args: nil, controller: nil)
    @object = object
    @ability = ability || controller&.__send__(:current_ability)
    @args = args || controller&.__send__(:api_maker_args)
  end

  def result
    parse_object(@object)
  end

private

  def parse_object(object)
    if object.is_a?(Hash)
      result = {}
      object.each do |key, value|
        result[key] = parse_object(value)
      end

      result
    elsif object.is_a?(Array)
      object.map { |value| parse_object(value) }
    elsif object.class.name == "Money"
      {api_maker_type: :money, amount: object.cents, currency: object.currency.iso_code}
    elsif object.is_a?(Date)
      object.iso8601
    elsif object.is_a?(Time)
      object.utc.iso8601
    elsif object.is_a?(ApiMaker::CollectionSerializer) || object.is_a?(ApiMaker::Serializer)
      parse_object(object.as_json)
    elsif object.is_a?(ActiveRecord::Base)
      serializer = ApiMaker::Serializer.new(ability: ability, args: args, model: object)

      {
        api_maker_type: :model,
        model_name: serializer.resource.collection_name,
        serialized: serializer.as_json
      }
    else
      object
    end
  end
end
