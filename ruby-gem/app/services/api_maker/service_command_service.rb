class ApiMaker::ServiceCommandService < ApiMaker::CommandService
  def execute
    ApiMaker::ServiceCommand.execute_in_thread!(
      ability: ability,
      api_maker_args: api_maker_args,
      collection: nil,
      commands: commands,
      command_response: command_response,
      controller: controller
    )

    succeed!
  end
end
