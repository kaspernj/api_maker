class Resources::ProjectDetailResource < Resources::ApplicationResource
  attributes :id, :project_id, :details
  relationships :project

  def abilities
    can CRUD, ProjectDetail
  end
end
