class Resources::TaskResource < Resources::ApplicationResource
  attributes :created_at, :finished, :id, :name, :project_id, :user_id, :custom_id
  collection_commands :command_serialize, :test_collection
  member_commands :test_member
  relationships :account, :project, :user

  def abilities
    can CRUD + [:accessible_by, :test_collection, :test_member, :validate, :update_events], Task, user_id: current_user.id if current_user
    can :command_serialize, Task
    can :test_accessible_by, Task, id: 3
  end

  def custom_id
    "custom-#{model.id}"
  end

  def permitted_params(arg)
    arg.params.require(:task).permit(:finished, :task)
  end
end
