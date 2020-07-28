class ApiMaker::Serializer
  attr_reader :ability, :args, :locals, :model

  delegate :id, to: :model

  def self.resource_for(klass)
    ApiMaker::MemoryStorage.current.resource_for_model(klass)
  rescue NameError
    nil
  end

  def self.resource_for!(klass)
    ApiMaker::MemoryStorage.current.resource_for_model(klass)
  end

  def initialize(ability: nil, args: {}, locals: nil, model:, select: nil)
    @ability = ability
    @args = args
    @locals = locals || args[:locals] || {}
    @model = model
    @select = select
  end

  def attributes
    ApiMaker::Configuration.profile("attributes") do
      result = {}
      attributes_to_read.each do |attribute, data|
        if (if_name = data.dig(:args, :if))
          condition_result = attribute_value(if_name)
          next unless condition_result
        end

        result[attribute] = attribute_value(attribute)
      end

      result
    end
  end

  def attributes_to_read
    @attributes_to_read ||= @select || resource.default_select
  end

  def attribute_value(attribute)
    if resource_instance.respond_to?(attribute)
      resource_instance.__send__(attribute)
    else
      model.__send__(attribute)
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
    @resource ||= ApiMaker::MemoryStorage.current.resource_for_model(model.class)
  end

  def resource_instance
    @resource_instance ||= resource.new(ability: ability, args: args, locals: locals, model: model)
  end

  def result
    @result ||= begin
      result = {a: attributes}
      result[:b] = @abilities if @abilities # Only use b-key if any abilities was loaded
      result[:r] = @relationships if @relationships # Only preload relationships if set
      result
    end
  end

  def as_json(_options = nil)
    result
  end

  def to_json(_options = nil)
    JSON.generate(as_json)
  end

  def inspect
    "<ApiMaker::Serializer id=\"#{model.id}\" model=\"#{model.class.name}\" relationships=\"#{relationships}\">"
  end

  alias to_s inspect
end
