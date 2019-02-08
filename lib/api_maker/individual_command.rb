class ApiMaker::IndividualCommand
  attr_reader :args, :id

  def initialize(id:, args:, collection:, model_id: nil, response:)
    @id = id
    @args = args
    @collection = collection
    @model_id = model_id
    @response = response
  end

  def model
    @model ||= @collection.to_a.find { |model| model.primary_key == @model_id }
  end

  def result(data)
    @response.result_for_command(@id, data)
  end
end
