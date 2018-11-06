class Resources::TaskResource < Resources::ApplicationResource
  collection_commands :test_collection
  member_commands :test_member

  attributes :created_at, :id, :name, :project_id, :user_id

  relationships :project, :user
end
