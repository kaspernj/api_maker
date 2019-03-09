class ApiMaker::ValidCommandService < ApiMaker::ApplicationService
  def initialize(commands:, command_name:, model_name:, controller:) # rubocop:disable Lint/UnusedMethodArgument
    raise "No controller given" if controller.blank?

    @ability = controller.__send__(:current_ability)
    @commands = commands
    @controller = controller
    @model_name = model_name
  end

  def execute!
    command_response = ApiMaker::CommandResponse.new
    instance = ApiMaker::ValidCommand.new(
      collection: collection,
      commands: @commands,
      command_response: command_response,
      controller: @controller
    )
    instance.execute!

    ServicePattern::Response.new(result: command_response.result)
  end

  def collection
    @collection ||= klass.accessible_by(@ability)
  end

  def klass
    @klass ||= @model_name.singularize.camelize.constantize
  end
end
