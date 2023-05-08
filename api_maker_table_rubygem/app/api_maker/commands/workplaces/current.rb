class Commands::Workplaces::Current < Commands::ApplicationCommand
  def execute!
    workplace_query = WorkerPlugins::Workplace.where(id: current_workplace)

    # Support passing params to also load abilities and avoid doing another commands for this in the bottom bar
    collection_serializer = ApiMaker::CollectionSerializer.new(
      ability: current_ability,
      collection: workplace_query,
      query_params: args&.dig(:params)
    )

    response = {current: collection_serializer}

    # Support to count links to avoid doing another commands in the bottom bar
    if args&.dig(:links_count)
      response[:links_count] = current_workplace
        .workplace_links
        .ransack(args.dig(:links_count, :ransack))
        .result
        .count
    end

    succeed!(response)
  end
end
