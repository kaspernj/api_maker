class ApiMaker::ValidCommandService < ApiMaker::CommandService
  def perform
    ApiMaker::ValidCommand.execute_in_thread!(
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
    @collection ||= model_class.accessible_by(@ability, :valid).where(model_class.primary_key => ids)
  end

  def ids
    @commands.values.map { |command| command.fetch("primary_key") }
  end
end
