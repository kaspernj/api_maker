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

    ServicePattern::Response.new(success: true)
  end

  def authorize!
    raise CanCan::AccessDenied, "No access to '#{@command_name}' on '#{klass.name}'" unless @ability.can?(@command_name.to_sym, klass)
  end

  def constant
    @constant ||= "Commands::#{namespace}::#{@command_name.camelize}".constantize
  end

  def namespace
    @namespace ||= resource.plural_name
  end

  def resource
    @resource ||= ApiMaker::MemoryStorage.current.resource_for_model(klass)
  end

  def klass
    @klass ||= @model_name.singularize.camelize.constantize
  end
end
