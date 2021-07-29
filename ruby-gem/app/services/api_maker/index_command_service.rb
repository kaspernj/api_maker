class ApiMaker::IndexCommandService < ApiMaker::CommandService
  def perform
    ApiMaker::IndexCommand.execute_in_thread!(
      ability: ability,
      api_maker_args: api_maker_args,
      collection: collection,
      commands: commands,
      command_response: command_response,
      controller: controller
    )

    succeed!
  end

  def collection
    @collection ||= model_class.accessible_by(ability)
  end

  def ids
    @ids ||= commands.values.map { |command| command.fetch("primary_key") }
  end
end
