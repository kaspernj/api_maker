class ApiMaker::IndividualCommand
  attr_reader :args, :collection, :command, :id, :primary_key, :response

  def initialize(id:, args:, collection:, command:, primary_key: nil, response:)
    @id = id
    @args = args
    @collection = collection
    @command = command
    @primary_key = primary_key
    @response = response
  end

  def error(data = nil)
    response.error_for_command(id, data)
  end

  def fail(data = nil)
    response.fail_for_command(id, data)
  end

  def model
    @model ||= begin
      raise "Collection wasn't set" unless collection

      model ||= collection.find { |model_in_collection| model_in_collection.id.to_s == primary_key.to_s }
      raise_model_not_found_or_no_access unless model

      model
    end
  end

  def model_id
    primary_key
  end

  def raise_model_not_found_or_no_access
    command_name = command.class.name
      .gsub(/\ACommands::/, "")
      .gsub(/Command\Z/, "")

    model_name = collection.klass.name

    raise "Couldn't find or no access to #{model_name} #{primary_key} on the #{command_name} command"
  end

  def result(data = nil)
    response.result_for_command(id, ApiMaker::ResultParser.parse(data, controller: response.controller))
  end
end
