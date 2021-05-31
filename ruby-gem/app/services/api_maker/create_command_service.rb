class ApiMaker::CreateCommandService < ApiMaker::CommandService
  def perform
    ApiMaker::CreateCommand.execute_in_thread!(
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
    @collection ||= model_class.accessible_by(@ability, :create)
  end
end
