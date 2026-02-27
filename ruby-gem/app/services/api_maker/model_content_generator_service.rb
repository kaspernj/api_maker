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
    resource._attributes.map do |attribute, attribute_data|
      attribute_s = attribute.to_s
      column = columns[attribute_s]
      column_data = _column_data(column) if column

      attributes[attribute] = {
        column: column_data,
        name: attribute,
        selected_by_default: attribute_data.dig(:args, :selected_by_default),
        translated: attribute_translated?(attribute_s)
      }
    end
    attributes
  end

  def attribute_translated?(attribute_name)
    model_class
      .reflections["translations"]
      &.klass
      &.columns
      &.any? { |column| column.name == attribute_name }
  rescue ActiveRecord::StatementInvalid
    # This happens if the table or column doesn't exist - like if we are running during a migration
    false
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

  def _column_data(column)
    {
      default: column.default,
      name: column.name,
      null: column.null,
      type: column.type
    }
  end

  def columns
    @columns ||= begin
      result = {}
      model_class.columns.each do |column|
        result[column.name] = column
      end

      result
    rescue ActiveRecord::StatementInvalid
      # This happens if the table or column doesn't exist - like if we are running during a migration
      {}
    end
  end

  def member_commands
    ApiMaker::Loader.load_resources

    result = {}
    member_commands = ApiMaker::MemoryStorage.current.storage_for(resource, :member_commands)
    member_commands.each_key do |member_command_name|
      result[member_command_name] = {name: member_command_name}
    end

    result
  end

  def model_content
    {
      attributes:,
      collection_commands:,
      member_commands:,
      model_class_data:,
      monetized_attributes:,
      relationships:
    }
  end

  def model_class_data # rubocop:disable Metrics/AbcSize
    {
      attributes:,
      className: model_class.name,
      collectionKey: model_class.model_name.collection,
      collectionName: resource.collection_name,
      i18nKey: model_class.model_name.i18n_key,
      camelizedLower: model_class.model_name.name.camelize(:lower),
      name: resource.short_name,
      nameDasherized: resource.short_name.underscore.dasherize,
      pluralName: model_class.model_name.plural,
      ransackable_associations:,
      ransackable_attributes:,
      ransackable_scopes:,
      relationships: reflections_for_model_class_data,
      paramKey: model_class.model_name.param_key,
      primaryKey: model_class.primary_key
    }
  end

  def ransackable_associations
    model_class.ransackable_associations.sort.map do |association_name|
      reflection = model_class.reflections[association_name]

      unless reflection
        raise "Couldnt find reflection by that name: #{name} on the model: #{model_class.name}. Reflections found: #{model_class.reflections.keys.join(", ")}"
      end

      _reflection_data(reflection, ignore_resource_not_found: true)
    end
  rescue RuntimeError => e
    raise e unless e.message.start_with?("Ransack needs ")

    []
  end

  def ransackable_attributes
    model_class.ransackable_attributes.sort.map do |attribute_name|
      column = columns[attribute_name.to_s]
      column_data = _column_data(column) if column

      {
        name: attribute_name,
        column: column_data
      }
    end
  rescue RuntimeError => e
    raise e unless e.message.start_with?("Ransack needs ")

    []
  rescue ActiveRecord::StatementInvalid
    # This happens if the table or column doesn't exist - like if we are running during a migration
    []
  end

  def ransackable_scopes
    model_class.ransackable_scopes.sort.map do |scope_name|
      {name: scope_name}
    end
  rescue RuntimeError => e
    raise e unless e.message.start_with?("Ransack needs ")

    []
  end

  def monetized_attributes
    @monetized_attributes ||= model_class.try(:monetized_attributes).try(:map) { |attribute| {name: attribute[0]} } || []
  end

  def reflections
    @reflections ||= resource._relationships.map do |name, _data|
      reflection = model_class.reflections[name.to_s]

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
        active_record: {
          name: reflection.active_record.name,
          primary_key: reflection.active_record.primary_key
        },
        class_name: reflection.class_name,
        foreign_key: reflection.foreign_key,
        klass: {
          primary_key: reflection.klass.primary_key
        },
        options: {
          as: reflection.options[:as],
          primary_key: reflection.options[:primary_key],
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
      _reflection_data(reflection)
    end
  end

  def _reflection_data(reflection, ignore_resource_not_found: false)
    begin
      resource = ApiMaker::MemoryStorage.current.resource_for_model(reflection.klass)
    rescue ApiMaker::MemoryStorage::ResourceNotFoundError, ArgumentError => e
      # ArgumentError because polymorphic associations works differently
      raise e unless ignore_resource_not_found
    end

    begin
      foreign_key = reflection.foreign_key
    rescue => e # rubocop:disable Style/RescueStandardError
      raise "Could not get foreign key for #{reflection.active_record.name}##{reflection.name} because of #{e.message}"
    end

    {
      className: reflection.class_name,
      collectionName: resource&.collection_name,
      foreignKey: foreign_key,
      name: reflection.name,
      macro: reflection.macro,
      resource_name: resource&.short_name,
      through: reflection.options[:through]
    }
  end
end
