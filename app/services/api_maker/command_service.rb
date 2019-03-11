class ApiMaker::CommandService < ApiMaker::ApplicationService
  attr_reader :ability, :args, :commands, :command_name, :model_name, :controller

  def initialize(ability:, args:, commands:, command_name:, model_name:, controller:)
    @ability = ability
    @args = args
    @command_name = command_name
    @commands = commands
    @controller = controller
    @model_name = model_name
  end
end
