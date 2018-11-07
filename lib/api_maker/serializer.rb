class ApiMaker::Serializer
  def self.resource_for(klass)
    "Resources::#{klass.name}Resource".constantize
  rescue NameError
    nil
  end

  def initialize(model:, controller: nil, include_param: nil)
    @model = model
    @controller = controller
    @include_param = include_param
  end

  def attributes
    result = {}
    resource._attributes.each do |attribute|
      if resource_instance.respond_to?(attribute)
        result[attribute] = resource_instance.__send__(attribute)
      else
        result[attribute] = @model.__send__(attribute)
      end
    end

    result
  end

  def current_ability
    @controller&.__send__(:current_ability)
  end

  def resource
    @resource ||= ApiMaker::Serializer.resource_for(@model.class)
  end

  def resource_instance
    @resource_instance ||= resource.new(model: @model, controller: @controller, include_param: @include_param)
  end

  def relationships
    result = {}
    return result unless @include_param

    parsed = ApiMaker::RelationshipIncluder.parse(@include_param)
    parsed.each do |key, value|
      next unless key

      key = key.to_sym
      association = @model.association(key)
      scope = association.association_scope

      if association.is_a?(ActiveRecord::Associations::BelongsToAssociation) || association.is_a?(ActiveRecord::Associations::HasOneAssociation)
        scope = scope.accessible_by(current_ability) if current_ability
        model = scope.first

        if model
          serializer = ApiMaker::Serializer.new(model: model, controller: @controller, include_param: value)
          result[key] = serializer.result
        else
          result[key] = nil
        end
      else
        collection_serializer = ApiMaker::CollectionSerializer.new(collection: scope, controller: @controller, include_param: value)
        result[key] = collection_serializer.result
      end
    end

    result
  end

  def result
    attributes.merge(relationships)
  end

  def to_json
    result.to_json
  end
end
