class Commands::Workplaces::AddCollection < Commands::ApplicationCommand
  alias workplace model

  def execute!
    WorkerPlugins::AddCollection.execute!(
      query: query,
      workplace: workplace
    )
    succeed!(success: true)
  end

  def query
    @query ||= args.fetch(:query).query
  end
end
