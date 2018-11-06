class Resources::ProjectResource < Resources::ApplicationResource
  attributes :id, :name, :created_at
  relationships :tasks, :task
end
