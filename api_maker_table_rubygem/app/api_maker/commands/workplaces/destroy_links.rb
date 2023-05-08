class Commands::Workplaces::DestroyLinks < Commands::ApplicationCommand
  def execute!
    destroyed = {}

    args.fetch(:models).each do |model_name, ids|
      # Convert from string to integer. API maker stringifies all arguments because of FormData usage
      ids = ids.map(&:to_s)
      resource = Resources.const_get("#{model_name}Resource")
      model_class_name = resource.model_class.name

      current_workplace.workplace_links.where(resource_id: ids, resource_type: model_class_name).delete_all
      destroyed[model_name] ||= ids
    end

    current_workplace.api_maker_event("workplace_links_destroyed", destroyed: destroyed)
    succeed!(success: true)
  end
end
