class ApiMaker::CommandService < ApiMaker::ApplicationService
  attr_reader :ability, :args, :commands, :command_name, :command_response, :model_name, :controller

  def initialize(ability:, args:, commands:, command_name:, command_response:, model_name:, controller:)
    @ability = ability
    @args = args
    @command_name = command_name
    @command_response = command_response
    @commands = commands
    @controller = controller
    @model_name = model_name
  end
end
