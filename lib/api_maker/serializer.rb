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
      query = @model.__send__(key)

      if query.is_a?(ActiveRecord::Base)
        serializer = ApiMaker::Serializer.new(model: query, controller: @controller, include_param: value)

        if !@controller || current_ability.can?(:read, query)
          result[key] = serializer.result
        else
          result[key] = nil
        end
      elsif query
        collection_serializer = ApiMaker::CollectionSerializer.new(collection: query, controller: @controller, include_param: value)
        result[key] = collection_serializer.result
      else
        result[key] = nil
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
