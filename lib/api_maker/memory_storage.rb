class ApiMaker::MemoryStorage
  attr_reader :storage

  def self.current
    @current ||= ApiMaker::MemoryStorage.new
  end

  def initialize
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

  def resource_for_model(model_class)
    "Resources::#{model_class.name}Resource".safe_constantize
  end
end
