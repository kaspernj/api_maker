class ApiMaker::CommandService < ApiMaker::ApplicationService
  attr_reader :ability, :args, :commands, :command_name, :command_response, :controller, :resource_name

  def initialize(ability:, args:, commands:, command_name:, command_response:, controller:, resource_name:)
    @ability = ability
    @args = args
    @command_name = command_name
    @command_response = command_response
    @commands = commands
    @controller = controller
    @resource_name = resource_name
  end

  def namespace
    @namespace ||= resource_name.camelize
  end

  def resource
    @resource ||= begin
      resource_class_name = "Resources::#{resource_name.underscore.singularize.camelize}Resource"
      resource = resource_class_name.safe_constantize
      raise "Couldnt find resource from resource name: #{resource_class_name}" unless resource

      resource
    end
  end

  def model_class
    @model_class ||= resource.model_class
  end
end
