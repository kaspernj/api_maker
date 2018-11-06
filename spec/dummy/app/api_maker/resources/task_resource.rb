class Resources::TaskResource < Resources::ApplicationResource
  attributes :created_at, :id, :name, :project_id, :user_id, :custom_id
  collection_commands :test_collection
  member_commands :test_member
  relationships :project, :user

  def custom_id
    "custom-#{model.id}"
  end
end
