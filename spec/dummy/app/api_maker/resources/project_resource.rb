class Resources::ProjectResource < Resources::ApplicationResource
  attributes :id, :name, :created_at, :price_per_hour
  relationships :project_detail, :tasks

  def abilities
    can CRUD, Project
  end

  def permitted_params(arg)
    arg.params.require(:project).permit(:name)
  end
end
