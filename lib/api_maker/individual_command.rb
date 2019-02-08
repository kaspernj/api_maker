class ApiMaker::IndividualCommand
  attr_reader :args, :id

  def initialize(id:, args:, collection:, primary_key: nil, response:)
    @id = id
    @args = args
    @collection = collection
    @primary_key = primary_key
    @response = response
  end

  def fail(data = nil)
    @response.fail_for_command(@id, data)
  end

  def model
    raise "Collection wasn't set" unless @collection
    @model ||= @collection.find { |model| model.id.to_s == @primary_key }
    raise "Couldn't find model" unless @model
    @model
  end

  def model_id
    @primary_key
  end

  def result(data = nil)
    @response.result_for_command(@id, data)
  end
end
