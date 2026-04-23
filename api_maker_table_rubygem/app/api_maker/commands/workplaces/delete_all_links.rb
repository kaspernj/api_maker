class Commands::Workplaces::DeleteAllLinks < Commands::ApplicationCommand
  alias workplace model

  def execute!
    model_type = args.fetch(:model_type)

    workplace
      .workplace_links
      .where(resource_type: model_type)
      .delete_all

    current_workplace.api_maker_event("workplace_links_destroyed", resource_types: [model_type])
    succeed!(success: true)
  end
end
