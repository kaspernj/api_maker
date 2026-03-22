class Commands::Workplaces::Current < Commands::ApplicationCommand
  def execute!
    workplace = current_workplace
    workplace_query = WorkerPlugins::Workplace.where(id: workplace)

    # Support passing params to also load abilities and avoid doing another commands for this in the bottom bar
    collection_serializer = ApiMaker::CollectionSerializer.new(
      ability: current_ability,
      collection: workplace_query,
      query_params: args&.dig(:params)
    )

    response = {current: collection_serializer}

    # Support to count links to avoid doing another commands in the bottom bar
    if args&.dig(:links_count)
      response[:links_count] = if workplace.present?
        workplace.workplace_links.ransack(args.dig(:links_count, :ransack)).result.count
      else
        0
      end
    end

    succeed!(response)
  end
end
