class ApiMaker::MemberCommandService < ApiMaker::ApplicationService
  def initialize(commands:, command_name:, model_name:, controller:)
    @ability = controller.__send__(:current_ability)
    @command_name = command_name
    @commands = commands
    @controller = controller
    @model_name = model_name
  end

  def execute!
    command_response = ApiMaker::CommandResponse.new

    ability_name = @command_name.to_sym
    collection = klass.accessible_by(@ability, ability_name).where(klass.primary_key => ids)

    instance = constant.new(
      collection: collection,
      commands: @commands,
      command_response: command_response,
      controller: @controller
    )
    instance.execute!

    ServicePattern::Response.new(result: command_response.result)
  end

  def collection
    klass.where(klass.primary_key => @command.fetch(:ids))
  end

  def constant
    @constant ||= proc do
      "Commands::#{namespace}::#{@command_name.camelize}".constantize
    end.call
  end

  def ids
    @commands.values.map { |command| command.fetch("primary_key") }
  end

  def namespace
    @namespace ||= @model_name.camelize
  end

  def klass
    @klass ||= @model_name.singularize.camelize.constantize
  end
end
