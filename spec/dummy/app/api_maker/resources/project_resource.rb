class Resources::ProjectResource < Resources::ApplicationResource
  attributes :id, :name, :created_at
  relationships :project_detail, :tasks
end
