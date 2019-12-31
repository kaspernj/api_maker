class ApiMaker::CollectionCommandService < ApiMaker::CommandService
  def execute
    authorize!

    constant.execute_in_thread!(
      ability: ability,
      args: args,
      collection: nil,
      commands: commands,
      command_response: command_response,
      controller: controller
    )

    succeed!
  end

  def authorize!
    raise CanCan::AccessDenied, "No access to '#{@command_name}' on '#{model_class.name}'" unless @ability.can?(@command_name.to_sym, model_class)
  end

  def constant
    @constant ||= "Commands::#{namespace}::#{@command_name.camelize}".constantize
  end
end
