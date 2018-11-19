class ProjectDetailResource < Resources::ApplicationResource
  attributes :id, :project_id, :details
  relationships :project
end
