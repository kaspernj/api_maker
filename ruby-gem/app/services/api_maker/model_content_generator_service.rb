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
    collection_commands.each_key do |collection_command_name|
      result[collection_command_name] = {name: collection_command_name}
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
      relationships: reflections_for_model_class_data,
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
      relationships[reflection.name] = {
        active_record: {name: reflection.active_record.name},
        class_name: reflection.class_name,
        foreign_key: reflection.foreign_key,
        options: {
          as: reflection.options[:as],
          through: reflection.options[:through]
        },
        resource_name: ApiMaker::MemoryStorage.current.resource_for_model(reflection.klass).short_name,
        type: reflection.macro
      }
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
