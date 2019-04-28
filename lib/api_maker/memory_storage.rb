class ApiMaker::MemoryStorage
  attr_reader :storage

  def self.current
    @current ||= ApiMaker::MemoryStorage.new
  end

  def initialize
    @model_class_for = {}
    @storage = {}
  end

  def storage_for(klass, mode)
    @storage.dig(klass, mode) || {}
  end

  def add(klass, mode, data, args = {})
    @storage[klass] ||= {}
    @storage[klass][mode] ||= {}
    @storage[klass][mode][data] = {data: data, args: args} unless @storage[klass][mode].key?(data)
  end

  def model_class_for(resource:, klass:)
    @model_class_for[klass.name] = resource.name
  end

  def resource_for_model(model_class)
    class_name = @model_class_for[model_class.name] || "Resources::#{model_class.name.gsub("::", "")}Resource"
    resource_class = class_name.safe_constantize
    binding.pry unless resource_class
    raise "Resource couldn't be found from model: #{model_class}" unless resource_class
    resource_class
  end
end
