class ApiMaker::ValidCommandService < ApiMaker::CommandService
  def execute
    ApiMaker::ValidCommand.execute_in_thread!(
      ability: ability,
      args: args,
      collection: collection,
      commands: commands,
      command_response: command_response,
      controller: controller
    )
    succeed!
  end

  def collection
    @collection ||= model_class.accessible_by(@ability, :valid).where(model_class.primary_key => ids)
  end

  def ids
    @commands.values.map { |command| command.fetch("primary_key") }
  end
end
