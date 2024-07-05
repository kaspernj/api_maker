class ApiMaker::ResultParser
  attr_reader :ability, :api_maker_args

  def self.parse(*, **)
    ApiMaker::ResultParser.new(*, **).result
  end

  def initialize(object, ability: nil, api_maker_args: nil, controller: nil)
    @object = object
    @ability = ability || controller&.__send__(:current_ability)
    @api_maker_args = api_maker_args || controller&.__send__(:api_maker_args) || {}
  end

  def result
    parse_object(@object)
  end

private

  def parse_active_record(object)
    serializer = ApiMaker::Serializer.new(ability:, api_maker_args:, model: object)

    {
      api_maker_type: :model,
      model_name: serializer.resource.collection_name,
      serialized: parse_object(serializer.as_json)
    }
  end

  def parse_array(object)
    object.map { |value| parse_object(value) }
  end

  def parse_hash(object)
    result = {}
    object.each do |key, value|
      result[key] = parse_object(value)
    end

    result
  end

  def parse_object(object)
    if object.is_a?(Hash)
      parse_hash(object)
    elsif object.is_a?(Array)
      parse_array(object)
    elsif object.class.name == "Money" # rubocop:disable Style/ClassEqualityComparison
      {api_maker_type: :money, amount: object.cents, currency: object.currency.iso_code}
    elsif object.is_a?(Date)
      {api_maker_type: :date, value: object.iso8601}
    elsif object.is_a?(Time)
      {api_maker_type: :time, value: object.utc.iso8601}
    elsif object.is_a?(ApiMaker::CollectionSerializer) || object.is_a?(ApiMaker::Serializer)
      parse_object(object.as_json)
    elsif object.is_a?(Class) && object < ApiMaker::BaseResource
      {api_maker_type: :resource, name: object.short_name}
    elsif object.is_a?(ActiveRecord::Base)
      parse_active_record(object)
    else
      object
    end
  end
end
