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

  def namespace
    @namespace ||= @model_name.camelize
  end

  def resource
    @resource ||= "Resources::#{resource_name}Resource".safe_constantize
  end

  def resource_name
    @resource_name ||= @model_name.underscore.singularize.camelize
  end

  def model_class
    @model_class ||= resource.model_class
  end
end
