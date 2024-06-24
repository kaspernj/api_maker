class Commands::Projects::CreateProject < Commands::ApplicationCommand
  def execute!
    project = Project.new(params)

    if project.save
      succeed!
    else
      failure_save_response(model: project, params:)
    end
  end

  def params
    args.require(:project).permit(:account_id, :name)
  end
end
