class ApiMaker::MemberCommandService < ApiMaker::CommandService
  def execute!
    ability_name = @command_name.to_sym
    collection = klass.accessible_by(@ability, ability_name).where(klass.primary_key => ids)

    constant.execute_in_thread!(
      ability: ability,
      args: args,
      collection: collection,
      commands: commands,
      command_response: command_response,
      controller: controller
    )
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
