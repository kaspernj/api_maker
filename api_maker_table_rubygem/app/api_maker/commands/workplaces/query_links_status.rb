class Commands::Workplaces::QueryLinksStatus < Commands::ApplicationCommand
  alias workplace model

  def execute!
    result = WorkerPlugins::QueryLinksStatus.execute!(query: query, workplace: workplace)
    succeed!(result)
  end

  def query
    args.fetch(:query).query
  end
end
