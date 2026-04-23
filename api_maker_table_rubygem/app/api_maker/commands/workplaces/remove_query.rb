class Commands::Workplaces::RemoveQuery < Commands::ApplicationCommand
  alias workplace model

  def execute!
    WorkerPlugins::RemoveQuery.execute!(query: query, workplace: workplace)
    workplace.api_maker_event("workplace_links_destroyed", resource_types: [model_class.name])
    succeed!(success: true)
  end

  def model_class
    @model_class ||= query.klass
  end

  def query
    @query ||= args.fetch(:query).query
  end
end
