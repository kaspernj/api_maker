class ApiMaker::ServiceCommandService < ApiMaker::CommandService
  def perform
    ApiMaker::ServiceCommand.execute_in_thread!(
      ability:,
      api_maker_args:,
      collection: nil,
      commands:,
      command_response:,
      controller:
    )

    succeed!
  end
end
