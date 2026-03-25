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
      response[:links_count] = workplace
        .workplace_links
        .ransack(args.dig(:links_count, :ransack))
        .result
        .count
    end

    succeed!(response)
  rescue NameError => e
    Rails.logger.error "[Workplaces::Current] NameError: #{e.message}"
    Rails.logger.error "[Workplaces::Current] Workplace columns: #{WorkerPlugins::Workplace.column_names.inspect}"
    Rails.logger.error "[Workplaces::Current] Resource attributes: #{Resources::WorkplaceResource._attributes.keys.inspect}"
    Rails.logger.error "[Workplaces::Current] Backtrace:\n#{e.backtrace.first(20).join("\n")}"
    raise
  end
end
