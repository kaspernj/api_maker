class ApiMaker::MemoryStorage
  attr_reader :model_class_for_data, :storage

  def self.current
    @current ||= ApiMaker::MemoryStorage.new
  end

  def initialize
    @model_class_for_data = {}
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

  def load_all_resources
    resources_path = Rails.root.join("app/api_maker/resources")

    Dir.foreach(resources_path) do |file|
      match = file.match(/\A((.+)_resource)\.rb\Z/)
      next unless match

      resource_name = match[1]
      resource_class_name = "Resources::#{resource_name.camelize}"

      # Load the resource by constantizing it to support auto loading
      resource_class_name.safe_constantize
    end

    @resources_loaded = true
  end

  def resources_loaded?
    @resources_loaded
  end

  def model_class_for(resource:, klass:)
    model_class_for_data[klass.name] = resource.name
  end

  def resource_for_model(model_class)
    class_name = resource_name_for_model(model_class)
    resource_class = class_name.safe_constantize

    unless resource_class
      if resources_loaded?
        raise "Resource couldn't be found from model: #{model_class}"
      else
        load_all_resources # Some resources with custom model class won't have been loaded at this point
        return resource_for_model(model_class)
      end
    end

    resource_class
  end

  def resource_name_for_model(model_class)
    model_class_for_data[model_class.name] || "Resources::#{model_class.name.gsub("::", "")}Resource"
  end
end
