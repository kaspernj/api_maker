class ApiMaker::IndividualCommand
  attr_reader :args, :command, :id, :response

  def initialize(id:, args:, collection:, command:, primary_key: nil, response:)
    @id = id
    @args = args
    @collection = collection
    @command = command
    @primary_key = primary_key
    @response = response
  end

  def error(data = nil)
    @response.error_for_command(@id, data)
  end

  def fail(data = nil)
    @response.fail_for_command(@id, data)
  end

  def model
    raise "Collection wasn't set" unless @collection
    @model ||= @collection.find { |model| model.id.to_s == @primary_key.to_s }
    raise "Couldn't find model by that ID: #{@primary_key}" unless @model
    @model
  end

  def model_id
    @primary_key
  end

  def result(data = nil)
    @response.result_for_command(@id, ApiMaker::ResultParser.parse(data, controller: response.controller))
  end
end
