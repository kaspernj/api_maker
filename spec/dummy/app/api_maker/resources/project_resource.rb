class Resources::ProjectResource < Resources::ApplicationResource
  attributes :id, :name, :created_at
  relationships :project_detail, :tasks

  def permitted_params(arg)
    arg.params.require(:project).permit(:name)
  end
end
