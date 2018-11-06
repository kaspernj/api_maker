class ApiMaker::SerializedCollection
  def initialize(collection:, controller:, include_param:)
    @collection = collection
    @controller = controller
    @include_param = include_param
  end

  def result
    array = []

    @collection.each do |model|
      serializer = ApiMaker::Serializer.new(model: model, controller: @controller, include_param: @include_param)
      array << serializer.result
    end

    array
  end
end
