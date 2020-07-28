class ApiMaker::ServiceCommandService < ApiMaker::CommandService
  def execute
    ApiMaker::ServiceCommand.execute_in_thread!(
      ability: ability,
      args: args,
      collection: nil,
      commands: commands,
      command_response: command_response,
      controller: controller,
      locals: locals
    )

    succeed!
  end
end
