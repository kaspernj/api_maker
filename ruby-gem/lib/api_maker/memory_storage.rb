class ApiMaker::MemoryStorage
  class ResourceNotFoundError < RuntimeError; end

  attr_reader :model_class_for_data, :storage

  def self.current
    @current ||= ApiMaker::MemoryStorage.new
  end

  def initialize
    @model_class_for_data = {}
    @resources_loaded = false
    @storage = {}
  end

  def storage_for(klass, mode)
    @storage.dig(klass.name, mode) || {}
  end

  def add(klass, mode, data, args = {})
    klass_name = klass.name

    @storage[klass_name] ||= {}
    @storage[klass_name][mode] ||= {}
    @storage[klass_name][mode][data] = {data:, args:} unless @storage[klass_name][mode].key?(data)
  end

  def load_all_resources
    ApiMaker::ModelsFinderService.execute!
    @resources_loaded = true
  end

  def resources_loaded?
    @resources_loaded
  end

  def model_class_for(resource:, klass:)
    model_class_for_data[klass.name] = resource.name
  end

  def resource_for_model(model_class)
    # Try to find matching resource from detected resources
    detected_resource = nil
    ::Resources.constants.each do |resource_class_name|
      resource_class = ::Resources.const_get(resource_class_name)

      if resource_class.model_class_name == model_class.name
        detected_resource = resource_class
        break
      end
    end

    return detected_resource if detected_resource

    # Try to find matching resource by guessing the name and resolving it
    class_name = resource_name_for_model(model_class)
    resource_class = class_name.safe_constantize

    unless resource_class
      if resources_loaded?
        raise ResourceNotFoundError, "Resource couldn't be found from model: #{model_class}"
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
