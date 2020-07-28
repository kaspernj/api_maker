class ApiMaker::IndexCommandService < ApiMaker::CommandService
  def execute
    ApiMaker::IndexCommand.execute_in_thread!(
      ability: ability,
      args: args,
      collection: collection,
      commands: commands,
      command_response: command_response,
      controller: controller,
      locals: locals
    )

    succeed!
  end

  def collection
    @collection ||= model_class.accessible_by(@ability)
  end

  def ids
    @ids ||= @commands.values.map { |command| command.fetch("primary_key") }
  end
end
