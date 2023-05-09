class Commands::Workplaces::RemoveQuery < Commands::ApplicationCommand
  alias workplace model

  def execute!
    result = WorkerPlugins::RemoveQuery.execute!(
      query: query,
      workplace: workplace
    )
    destroyed = result.fetch(:destroyed)
    workplace.api_maker_event("workplace_links_destroyed", destroyed: {model_class.name => destroyed})
    succeed!(success: true)
  end

  def model_class
    @model_class ||= query.klass
  end

  def query
    @query ||= args.fetch(:query).query
  end
end
