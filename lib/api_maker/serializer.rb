class ApiMaker::Serializer
  def self.resource_for(klass)
    "Resources::#{klass.name}Resource".constantize
  rescue NameError
    nil
  end

  def initialize(model:, controller:)
    @model = model
    @controller = controller
  end

  def attributes
    result = {}
    resource.attributes.each do |attribute|
      result[attribute] = @model.__send__(attribute)
    end

    result
  end

  def resource
    @resource ||= ApiMaker::Serializer.resource_for(self.class)
  end

  def result
    result = {}.merge(attributes)
    result
  end

  def to_json
    result.to_json
  end
end
