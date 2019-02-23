class ApiMaker::CollectionCommandService < ApiMaker::ApplicationService
  def initialize(commands:, command_name:, model_name:, controller:)
    raise "No controller given" if controller.blank?

    @ability = controller.__send__(:current_ability)
    @command_name = command_name
    @commands = commands
    @controller = controller
    @model_name = model_name
  end

  def execute!
    authorize!

    command_response = ApiMaker::CommandResponse.new

    instance = constant.new(
      collection: nil,
      commands: @commands,
      command_response: command_response,
      controller: @controller
    )
    instance.execute!

    ServicePattern::Response.new(result: command_response.result)
  end

  def authorize!
    raise CanCan::AccessDenied, "No access to '#{@command_name}' on '#{klass.name}'" unless @ability.can?(@command_name.to_sym, klass)
  end

  def constant
    @constant ||= "Commands::#{namespace}::#{@command_name.camelize}".constantize
  end

  def namespace
    @namespace ||= @model_name.camelize
  end

  def klass
    @klass ||= @model_name.singularize.camelize.constantize
  end
end
