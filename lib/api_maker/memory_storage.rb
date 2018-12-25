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
    @resources.each do |klass_data|
      return klass_data.fetch(:klass) if klass_data.fetch(:klass).model_class == model_class
    end

    raise "Couldnt find resource for model: #{model_class.name}"
  end
end
