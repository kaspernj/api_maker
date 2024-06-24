class ApiMaker::UpdateCommandService < ApiMaker::CommandService
  def perform
    ApiMaker::UpdateCommand.execute_in_thread!(
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
    @collection ||= model_class.accessible_by(@ability, :update).where(model_class.primary_key => ids)
  end

  def ids
    @commands.values.map { |command| command.fetch("primary_key") }
  end
end
