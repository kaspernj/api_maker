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
    @collection ||= klass.accessible_by(@ability, :create)
  end

  def klass
    @klass ||= @model_name.singularize.camelize.constantize
  end
end
