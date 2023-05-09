class Commands::Workplaces::AddQuery < Commands::ApplicationCommand
  alias workplace model

  def execute!
    result = WorkerPlugins::AddQuery.execute!(
      query: query,
      workplace: workplace
    )
    created = result.fetch(:created)
    workplace.api_maker_event("workplace_links_created", created: {model_class.name => created})
    succeed!(success: true)
  end

  def model_class
    @model_class ||= query.klass
  end

  def query
    @query ||= args.fetch(:query).query
  end
end
