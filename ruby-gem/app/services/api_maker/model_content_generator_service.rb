class ApiMaker::ModelContentGeneratorService < ApiMaker::ApplicationService
  attr_reader :resource

  delegate :model_class, to: :resource

  def initialize(resource:)
    @resource = resource
  end

  def perform
    succeed! model_content
  end

private

  def attributes
    attributes = {}
    resource._attributes.map do |attribute, _data|
      attributes[attribute] = {name: attribute}
    end
    attributes
  end

  def collection_commands
    ApiMaker::Loader.load_resources
    result = {}
    collection_commands = ApiMaker::MemoryStorage.current.storage_for(resource, :collection_commands)
    collection_commands.each_key do |collection_command_name, data|
      result[collection_command] = {name: collection_command_name}
    end

    result
  end

  def member_commands
    ApiMaker::Loader.load_resources
    ApiMaker::MemoryStorage.current.storage_for(resource, :member_commands)
  end

  def model_content
    {
      attributes: attributes,
      collection_commands: collection_commands,
      model_class_data: model_class_data,
      monetized_attributes: monetized_attributes,
      relationships: relationships
    }
  end

  def model_class_data
    {
      attributes: attributes,
      className: model_class.name,
      collectionKey: model_class.model_name.collection,
      collectionName: resource.collection_name,
      i18nKey: model_class.model_name.i18n_key,
      name: resource.short_name,
      pluralName: model_class.model_name.plural,
      reflections: reflections_for_model_class_data,
      paramKey: model_class.model_name.param_key,
      primaryKey: model_class.primary_key
    }
  end

  def monetized_attributes
    @monetized_attributes ||= model_class.try(:monetized_attributes).try(:map) { |attribute| {name: attribute[0]} } || []
  end

  def reflections
    @reflections ||= resource._relationships.map do |name, _data|
      reflection = model_class.reflections.values.find { |reflection_i| reflection_i.name == name }

      unless reflection
        raise "Couldnt find reflection by that name: #{name} on the model: #{model_class.name}. Reflections found: #{model_class.reflections.keys.join(", ")}"
      end

      reflection
    end
  end

  def relationships
    relationships = {}
    reflections.each do |reflection|
      reflection_data = {}
      reflection_data[:resource_name] = ApiMaker::MemoryStorage.current.resource_for_model(reflection.klass).short_name

      if reflection.macro == :belongs_to
        reflection_data[:type] = :belongs_to

      elsif reflection.macro == :has_many
        reflection_data[:type] = :has_many
        reflection_data[:foreign_key] = reflection.foreign_key
        reflection_data[:through] = true if reflection.options[:through]
      elsif reflection.macro == :has_one
        reflection_data[:type] = :has_one
        reflection_data[:foreign_key] = reflection.foreign_key
        reflection_data[:through] = true if reflection.options[:through]
      else
        raise "Unknown reflection: #{reflection.macro}"
      end

      relationships[reflection.name] = reflection_data
    end

    relationships
  end

  def reflections_for_model_class_data
    @reflections_for_model_class_data ||= reflections.map do |reflection|
      resource = ApiMaker::MemoryStorage.current.resource_for_model(reflection.klass)

      {
        className: reflection.class_name,
        collectionName: resource.collection_name,
        name: reflection.name,
        macro: reflection.macro,
        resource_name: resource.short_name
      }
    end
  end
end
