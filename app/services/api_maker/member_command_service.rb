class ApiMaker::MemberCommandService < ApiMaker::CommandService
  def execute!
    command_response = ApiMaker::CommandResponse.new

    ability_name = @command_name.to_sym
    collection = klass.accessible_by(@ability, ability_name).where(klass.primary_key => ids)

    instance = constant.new(
      ability: ability,
      args: args,
      collection: collection,
      commands: commands,
      command_response: command_response,
      controller: controller
    )
    instance.execute!

    ServicePattern::Response.new(result: command_response.result)
  end

  def constant
    @constant ||= "Commands::#{namespace}::#{@command_name.camelize}".constantize
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
