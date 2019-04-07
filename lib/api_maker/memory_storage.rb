class ApiMaker::MemoryStorage
  attr_reader :resources, :storage

  def self.current
    @current ||= ApiMaker::MemoryStorage.new
  end

  def initialize
    @resources = []
    @resources_by_model = {}
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
    resource = @resources_by_model[model_class] ||= @resources.detect { |klass_data| klass_data.fetch(:klass).model_class.name == model_class.name }&.fetch(:klass)
    raise NameError, "Couldnt find resource for model: #{model_class.name}" unless resource

    resource
  end
end
