class ApiMaker::BaseResource
  ApiMaker::IncludeHelpers.execute!(klass: self)

  attr_reader :ability, :api_maker_args, :locals, :model

  delegate :can, :can?, allow_nil: true, to: :ability

  CRUD = [:create, :create_events, :read, :update, :update_events, :destroy, :destroy_events].freeze
  READ = [:create_events, :destroy_events, :read, :update_events].freeze

  def self.attribute(attribute_name, **args)
    # Automatically add a columns argument if the attribute name matches a column name on the models table
    args[:requires_columns] = [attribute_name] if !args.key?(:requires_columns) && column_exists_on_model?(model_class, attribute_name)

    ApiMaker::MemoryStorage.current.add(self, :attributes, attribute_name, args)
  end

  def self.attributes(*attributes, **args)
    attributes.each do |attribute_name|
      attribute(attribute_name, args)
    end
  end

  def self._attributes
    ApiMaker::MemoryStorage.current.storage_for(self, :attributes)
  end

  def self.collection_commands(*list)
    list.each do |collection_command|
      ApiMaker::MemoryStorage.current.add(self, :collection_commands, collection_command)
    end
  end

  def self.column_exists_on_model?(model_class, column_name)
    model_class.column_names.include?(column_name.to_s)
  rescue ActiveRecord::StatementInvalid
    # This happens if the table or column doesn't exist - like if we are running during a migration
    false
  end

  def self.member_commands(*list)
    list.each do |member_command|
      ApiMaker::MemoryStorage.current.add(self, :member_commands, member_command)
    end
  end

  def self.model_class=(klass)
    # Set the name to avoid reloading issues with Rails
    @model_class_name ||= klass.name
    ApiMaker::MemoryStorage.current.model_class_for(resource: self, klass: klass)
  end

  def self.model_class
    # Use the name to constantize to avoid reloading issues with Rails
    model_class_name.constantize
  end

  def self.model_class_name
    @model_class_name ||= short_name
  end

  def self.relationships(*relationships)
    relationships.each do |relationship|
      ApiMaker::MemoryStorage.current.add(self, :relationships, relationship)
    end
  end

  def self._relationships
    ApiMaker::MemoryStorage.current.storage_for(self, :relationships)
  end

  def self.collection_name
    @collection_name ||= plural_name.underscore.dasherize
  end

  def self.default_select
    _attributes.select do |_attribute_name, args|
      !args.fetch(:args).key?(:selected_by_default) || args.fetch(:args).fetch(:selected_by_default)
    end
  end

  def self.plural_name
    @plural_name ||= short_name.pluralize
  end

  def self.require_name
    @require_name ||= collection_name.singularize
  end

  def self.short_name
    @short_name ||= name.match(/\AResources::(.+)Resource\Z/)[1]
  end

  def initialize(ability: nil, api_maker_args: {}, locals:, model:)
    @ability = ability
    @api_maker_args = api_maker_args
    @locals = locals || api_maker_args&.dig(:locals) || {}
    @model = model
  end
end
