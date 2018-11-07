class ApiMaker::Serializer
  def self.resource_for(klass)
    "Resources::#{klass.name}Resource".constantize
  rescue NameError
    nil
  end

  def initialize(ability: nil, args: {}, model:, include_param: nil)
    @args = args
    @model = model
    @ability = ability
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
    @resource_instance ||= resource.new(ability: current_ability, args: @args, model: @model, include_param: @include_param)
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
      scope = scope.accessible_by(current_ability) if current_ability

      if association.is_a?(ActiveRecord::Associations::BelongsToAssociation) || association.is_a?(ActiveRecord::Associations::HasOneAssociation)
        model = scope.first

        if model
          serializer = ApiMaker::Serializer.new(ability: @ability, args: @args, model: model, include_param: value)
          result[key] = serializer.result
        else
          result[key] = nil
        end
      else
        collection_serializer = ApiMaker::CollectionSerializer.new(ability: @ability, args: @args, collection: scope, include_param: value)
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
