class ApiMaker::MemoryStorage
  attr_reader :resources, :storage

  def self.current
    @current ||= ApiMaker::MemoryStorage.new
  end

  def initialize
    @resources = []
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

  def add_resource(klass)
    return if klass.name == "Resources::ApplicationResource"
    @resources << {klass: klass}
  end

  def resource_for_model(model_class)
    resource_to_model_classes.fetch(model_class)
  end

  def resource_to_model_classes
    @resource_to_model_classes ||= proc do
      result = {}
      @resources.each do |klass|
        result[klass.fetch(:klass).model_class] = klass.fetch(:klass)
      end

      result
    end.call
  end
end
