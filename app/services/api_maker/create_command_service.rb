class ApiMaker::CreateCommandService < ApiMaker::CommandService
  def execute
    ApiMaker::CreateCommand.execute_in_thread!(
      ability: ability,
      args: args,
      collection: collection,
      commands: commands,
      command_response: command_response,
      controller: controller
    )

    ServicePattern::Response.new(success: true)
  end

  def collection
    @collection ||= model_class.accessible_by(@ability, :create)
  end
end
