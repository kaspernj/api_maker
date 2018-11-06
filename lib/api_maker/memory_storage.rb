class ApiMaker::MemoryStorage
  attr_reader :attributes, :collection_methods, :member_methods, :relationships, :resources

  def self.current
    @current ||= ApiMaker::MemoryStorage.new
  end

  def initialize
    @attributes = []
    @collection_methods = []
    @member_methods = []
    @relationships = []
    @resources = []
  end

  def add_attribute(klass:, attribute:)
    return if @attributes.any? do |attribute_i|
      attribute_i.fetch(:klass) == klass && attribute_i.fetch(:attribute) == attribute
    end

    @attributes << {
      klass: klass,
      attribute: attribute
    }
  end

  def add_collection_method(klass:, collection_method:)
    return if @collection_methods.any? do |collection_method_i|
      collection_method_i.fetch(:klass) == klass && collection_method_i.fetch(:collection_method) == collection_method
    end

    @collection_methods << {
      klass: klass,
      collection_method: collection_method
    }
  end

  def add_member_method(klass:, member_method:)
    return if @member_methods.any? do |member_method_i|
      member_method_i.fetch(:klass) == klass && member_method_i.fetch(:member_method) == member_method
    end

    @member_methods << {
      klass: klass,
      member_method: member_method
    }
  end

  def add_relationship(klass:, relationship:)
    return if @relationships.any? do |relationship_i|
      relationship_i.fetch(:klass) == klass && relationship_i.fetch(:relationship) == relationship
    end

    @relationships << {
      klass: klass,
      relationship: relationship
    }
  end

  def add_resource(klass:)
    return if klass.name == "Resources::ApplicationResource"
    @resources << {klass: klass}
  end
end
