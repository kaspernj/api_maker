class ApiMaker::Serializer
  attr_reader :ability, :api_maker_args, :locals, :model

  delegate :id, to: :model

  def self.resource_for(klass)
    ApiMaker::MemoryStorage.current.resource_for_model(klass)
  rescue NameError
    nil
  end

  def self.resource_for!(klass)
    ApiMaker::MemoryStorage.current.resource_for_model(klass)
  end

  def initialize(ability: nil, api_maker_args: {}, locals: nil, model:, select: nil)
    @ability = ability
    @api_maker_args = api_maker_args
    @locals = locals || api_maker_args&.dig(:locals) || {}
    @model = model
    @select = select
  end

  def attributes
    profile("attributes") do
      result = {}
      attributes_to_read.each do |attribute, data|
        if (if_name = data.dig(:args, :if))
          if if_name.is_a?(Symbol)
            next unless attribute_value(if_name)
          elsif if_name.is_a?(Proc)
            next unless resource_instance.instance_eval(&if_name)
          else
            raise "Unknown type: #{if_name.class.name}"
          end
        end

        result[attribute] = attribute_value(attribute)
      end

      result
    end
  end

  def attributes_to_read
    @attributes_to_read ||= profile("attributes_to_read") do
      @select || resource.default_select
    end
  end

  def attribute_value(attribute)
    profile("attribute_value #{attribute}") do
      if resource_instance.respond_to?(attribute)
        resource_instance.__send__(attribute)
      else
        model.__send__(attribute)
      end
    end
  end

  def fetch(*args, &blk)
    result.fetch(*args, &blk)
  end

  def load_ability(ability_name, value)
    @abilities ||= {}
    @abilities[ability_name] = value
  end

  def relationships
    @relationships ||= {}
  end

  def resource
    @resource ||= profile("resource") do
      ApiMaker::MemoryStorage.current.resource_for_model(model.class)
    end
  end

  def resource_instance
    @resource_instance ||= profile("resource_instance") do
      resource.new(ability: ability, api_maker_args: api_maker_args, locals: locals, model: model)
    end
  end

  def result
    result = {a: attributes}
    result[:b] = @abilities if @abilities # Only use b-key if any abilities was loaded
    result[:r] = @relationships if @relationships # Only preload relationships if set
    result
  end

  def as_json(options = nil)
    profile("as_json") do
      if options && options[:result_parser]
        ApiMaker::ResultParser.new(result, ability: ability, api_maker_args: api_maker_args).result
      else
        result
      end
    end
  end

  def to_json(options = nil)
    profile("to_json") do
      JSON.generate(as_json(options))
    end
  end

  def inspect
    profile("inspect") do
      "<ApiMaker::Serializer id=\"#{model.id}\" model=\"#{model.class.name}\" relationships=\"#{relationships}\">"
    end
  end

  alias to_s inspect

private

  def profile(message, &blk)
    ApiMaker::Configuration.profile(-> { "Serializer for #{model.class.name}: #{message}" }, &blk)
  end
end
