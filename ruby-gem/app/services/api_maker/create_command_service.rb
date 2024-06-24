class ApiMaker::CreateCommandService < ApiMaker::CommandService
  def perform
    ApiMaker::CreateCommand.execute_in_thread!(
      ability:,
      api_maker_args:,
      collection:,
      commands:,
      command_response:,
      controller:
    )

    succeed!
  end

  def collection
    @collection ||= model_class.accessible_by(@ability, :create)
  end
end
