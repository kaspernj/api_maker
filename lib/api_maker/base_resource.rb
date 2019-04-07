class ApiMaker::BaseResource
  attr_reader :ability, :args, :model

  def self.attributes(*attributes, **args)
    attributes.each do |attribute|
      ApiMaker::MemoryStorage.current.add(self, :attributes, attribute, args)
    end
  end

  def self._attributes
    ApiMaker::MemoryStorage.current.storage_for(self, :attributes)
  end

  def self.inherited(base)
    ApiMaker::MemoryStorage.current.add_resource(base) unless ApiMaker::MemoryStorage.current.resources.include?(base)
  end

  def self.collection_commands(*list)
    list.each do |collection_command|
      ApiMaker::MemoryStorage.current.add(self, :collection_commands, collection_command)
    end
  end

  def self.member_commands(*list)
    list.each do |member_command|
      ApiMaker::MemoryStorage.current.add(self, :member_commands, member_command)
    end
  end

  def self.model_class=(klass) # rubocop:disable Style/TrivialAccessors
    @model_class = klass
  end

  def self.model_class
    @model_class ||= begin
      model_class_name = name.gsub(/Resource$/, "")
      model_class_name = model_class_name.gsub(/^Resources::/, "")
      model_class_name.constantize
    end
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
    @collection_name ||= short_name.underscore.pluralize.dasherize
  end

  def self.short_name
    @short_name ||= name.match(/\AResources::(.+)Resource\Z/)[1]
  end

  def initialize(ability: nil, args: {}, model:)
    @ability = ability
    @args = args
    @model = model
  end
end
