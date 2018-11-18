class ApiMaker::Serializer
  def self.resource_for(klass)
    "Resources::#{klass.name}Resource".constantize
  rescue NameError
    nil
  end

  def self.resource_for!(klass)
    "Resources::#{klass.name}Resource".constantize
  end

  def initialize(ability: nil, args: {}, model:)
    @args = args
    @model = model
    @ability = ability
  end

  def attributes
    result = {}
    resource._attributes.each do |attribute, data|
      if data.dig(:args, :if).present?
        condition_result = attribute_value(data.fetch(:args).fetch(:if))
        next unless condition_result
      end

      result[attribute] = attribute_value(attribute)
    end

    result
  end

  def attribute_value(attribute)
    if resource_instance.respond_to?(attribute)
      resource_instance.__send__(attribute)
    else
      @model.__send__(attribute)
    end
  end

  def current_ability
    @controller&.__send__(:current_ability)
  end

  def resource
    @resource ||= ApiMaker::Serializer.resource_for!(@model.class)
  end

  def resource_instance
    @resource_instance ||= resource.new(ability: current_ability, args: @args, model: @model)
  end

  def result
    {
      type: @model.class.model_name.plural,
      id: @model.id,
      attributes: attributes,
      relationships: {}
    }
  end

  def to_json
    result.to_json
  end
end
