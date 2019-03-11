class ApiMaker::UpdateCommandService < ApiMaker::CommandService
  def execute!
    command_response = ApiMaker::CommandResponse.new
    instance = ApiMaker::UpdateCommand.new(
      ability: ability,
      args: args,
      collection: collection,
      commands: commands,
      command_response: command_response,
      controller: controller
    )
    instance.execute!

    ServicePattern::Response.new(result: command_response.result)
  end

  def collection
    @collection ||= klass.accessible_by(@ability, :update).where(klass.primary_key => ids)
  end

  def ids
    @commands.values.map { |command| command.fetch("primary_key") }
  end

  def klass
    @klass ||= @model_name.singularize.camelize.constantize
  end
end
