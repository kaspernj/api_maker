class Commands::Workplaces::AddRelationshipToWorkplace < Commands::ApplicationCommand
  def execute!
    workplace = model
    resource_name = args.fetch(:model_class)
    resource_class = "Resources::#{resource_name}Resource".safe_constantize
    model_class = resource_class.model_class
    path = args.fetch(:path)

    Workplaces::AddRelationshipToWorkplace.execute!(
      model_class: model_class,
      path: path,
      workplace: workplace
    )

    succeed!(success: true)
  end
end
