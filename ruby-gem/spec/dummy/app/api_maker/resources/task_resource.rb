class Resources::TaskResource < Resources::ApplicationResource
  attributes :created_at, :finished, :id, :name, :project_id, :user_id, :custom_id
  collection_commands :command_serialize, :test_collection
  member_commands :test_member
  relationships :account, :comments, :project, :user

  USER_TASK_ABILITIES = [
    :accessible_by,
    :test_collection,
    :test_member,
    :validate,
    :create_events,
    :destroy_events,
    :update_events
  ].freeze

  def abilities
    can :read, Task if current_user&.admin?
    can CRUD + USER_TASK_ABILITIES, Task, user_id: current_user.id if current_user
    can :command_serialize, Task
    can :test_accessible_by, Task, id: 3
    can :read, Task, ["tasks.name = 'Some readable task'"] do
      task.title = "Some readable task"
    end

    can_access_through ability: :read, relationship: :account_marked_tasks
  end

  def custom_id
    "custom-#{model.id}"
  end

  def permitted_params(arg)
    arg.params.require(:task).permit(:finished, :name, :project_id, :task, :user_id)
  end
end
