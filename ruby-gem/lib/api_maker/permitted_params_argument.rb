class ApiMaker::PermittedParamsArgument
  attr_reader :command, :model

  def initialize(command:, model:)
    @command = command
    @model = model
  end

  def params
    command.args&.dig(:save)
  end
end
