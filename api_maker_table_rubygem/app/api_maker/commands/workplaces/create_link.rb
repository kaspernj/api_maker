class Commands::Workplaces::CreateLink < Commands::ApplicationCommand
  def execute!
    model_class = args.fetch(:model_class)
    model_id = args.fetch(:model_id).to_s
    model = model_class.safe_constantize.accessible_by(current_ability).find(model_id)

    if model
      current_workplace.workplace_links.create(resource: model)
      current_workplace.api_maker_event("workplace_links_created", created: {model_class => [model_id]})
      succeed!(success: true)
    else
      fail!(errors: ["Model not found or not accessible"])
    end
  end
end
