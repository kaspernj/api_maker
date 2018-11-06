class ApiMaker::CollectionSerializer
  def initialize(collection:, controller:, include_param:)
    @collection = collection
    @controller = controller
    @include_param = include_param
  end

  def accessible_collection
    return @collection.accessible_by(current_ability) if @controller
    @collection
  end

  def current_ability
    @controller&.__send__(:current_ability)
  end

  def result
    array = []

    accessible_collection.each do |model|
      serializer = ApiMaker::Serializer.new(model: model, controller: @controller, include_param: @include_param)
      array << serializer.result
    end

    array
  end
end
