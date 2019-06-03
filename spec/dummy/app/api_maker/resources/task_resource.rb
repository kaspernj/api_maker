class Resources::TaskResource < Resources::ApplicationResource
  attributes :created_at, :id, :name, :project_id, :user_id, :custom_id
  collection_commands :command_serialize, :test_collection
  member_commands :test_member
  relationships :account, :project, :user

  def custom_id
    "custom-#{model.id}"
  end

  def permitted_params(arg)
    arg.params.require(:task).permit(:task)
  end
end
