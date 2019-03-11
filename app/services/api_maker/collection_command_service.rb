class ApiMaker::CollectionCommandService < ApiMaker::CommandService
  def execute!
    authorize!

    command_response = ApiMaker::CommandResponse.new

    instance = constant.new(
      ability: ability,
      collection: nil,
      commands: commands,
      command_response: command_response,
      controller: controller
    )
    instance.execute!

    ServicePattern::Response.new(result: command_response.result)
  end

  def authorize!
    raise CanCan::AccessDenied, "No access to '#{@command_name}' on '#{klass.name}'" unless @ability.can?(@command_name.to_sym, klass)
  end

  def constant
    @constant ||= "Commands::#{namespace}::#{@command_name.camelize}".constantize
  end

  def namespace
    @namespace ||= @model_name.camelize
  end

  def klass
    @klass ||= @model_name.singularize.camelize.constantize
  end
end
