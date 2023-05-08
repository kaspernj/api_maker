class Commands::Workplaces::DeleteAllLinks < Commands::ApplicationCommand
  alias workplace model

  def execute!
    workplace_links = workplace
      .workplace_links
      .where(resource_type: args.fetch(:model_type))
      .select(:resource_id, :resource_type)

    destroyed = {}
    workplace_links.each do |workplace_link|
      destroyed[workplace_link.resource_type] ||= []
      destroyed[workplace_link.resource_type] << workplace_link.resource_id
    end

    workplace_links.delete_all
    current_workplace.api_maker_event("workplace_links_destroyed", destroyed: destroyed)
    succeed!(success: true)
  end
end
