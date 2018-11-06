class ApiMaker::Serializer
  def self.resource_for(klass)
    "Resources::#{klass.name}Resource".constantize
  rescue NameError
    nil
  end

  def initialize(model:, controller:, include_param:)
    @model = model
    @controller = controller
    @include_param = include_param
  end

  def attributes
    result = {}
    resource._attributes.each do |attribute|
      result[attribute] = @model.__send__(attribute)
    end

    result
  end

  def resource
    @resource ||= ApiMaker::Serializer.resource_for(@model.class)
  end

  def result
    attributes
  end

  def to_json
    result.to_json
  end
end
