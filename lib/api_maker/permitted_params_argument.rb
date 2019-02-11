class ApiMaker::PermittedParamsArgument
  attr_reader :command

  def initialize(command)
    @command = command
  end

  def model
    command.model
  end

  def params
    command.args
  end
end
