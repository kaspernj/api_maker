class ApiMaker::BaseResource
  attr_reader :model, :controller, :include_param

  def self.attributes(*attributes)
    attributes.each do |attribute|
      ApiMaker::MemoryStorage.current.add_attribute(
        klass: self,
        attribute: attribute
      )
    end
  end

  def self._attributes
    ApiMaker::MemoryStorage.current.attributes
      .select { |attribute_data| attribute_data.fetch(:klass) == self }
      .map { |attribute_data| attribute_data.fetch(:attribute) }
  end

  def self.inherited(base)
    ApiMaker::MemoryStorage.current.add_resource(klass: base) unless ApiMaker::MemoryStorage.current.resources.include?(base)
  end

  def self.collection_commands(*list)
    list.each do |collection_method|
      ApiMaker::MemoryStorage.current.add_collection_method(
        klass: self,
        collection_method: collection_method
      )
    end
  end

  def self.member_commands(*list)
    list.each do |member_method|
      ApiMaker::MemoryStorage.current.add_member_method(
        klass: self,
        member_method: member_method
      )
    end
  end

  def self.model_class
    model_class_name = name.gsub(/Resource$/, "")
    model_class_name = model_class_name.gsub(/^Resources::/, "")
    model_class_name.constantize
  end

  def self.relationships(*relationships)
    relationships.each do |relationship|
      ApiMaker::MemoryStorage.current.add_relationship(
        klass: self,
        relationship: relationship
      )
    end
  end

  def self._relationships
    ApiMaker::MemoryStorage.current.relationships.select { |relationship_data| relationship_data.fetch(:klass) == self }
  end

  def initialize(model:, controller:, include_param:)
    @model = model
    @controller = controller
    @include_param = include_param
  end
end
