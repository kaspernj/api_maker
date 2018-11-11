class ApiMaker::MemoryStorage
  attr_reader :resources

  def self.current
    @current ||= ApiMaker::MemoryStorage.new
  end

  def initialize
    @resources = []
    @storage = {}
  end

  def storage_for(klass, mode)
    @storage.dig(klass, mode) || []
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
end
