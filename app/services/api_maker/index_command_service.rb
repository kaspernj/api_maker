class ApiMaker::IndexCommandService < ApiMaker::CommandService
  def execute!
    puts "Execute index command service"
    command_response = ApiMaker::CommandResponse.new
    instance = ApiMaker::IndexCommand.new(
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
    @collection ||= klass.accessible_by(@ability)
  end

  def ids
    @ids ||= @commands.values.map { |command| command.fetch("primary_key") }
  end

  def klass
    @klass ||= @model_name.singularize.camelize.constantize
  end
end
