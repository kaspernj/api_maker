class Resources::TaskResource < Resources::ApplicationResource
  attributes :created_at, :custom_id, :finished, :id, :name, :priority, :project_id, :state, :translated_state, :user_id
  attributes :updated_at, selected_by_default: false
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
    can READ + [:update, :destroy], Task if current_user&.admin?
    can CRUD + USER_TASK_ABILITIES + [:model_class_event_test_model_class_event], Task, user_id: current_user.id if current_user
    can :command_serialize, Task
    can :test_accessible_by, Task, id: 3
    can :read, Task, ["tasks.name = 'Some readable task'"] do |task|
      task.name == "Some readable task"
    end

    can_access_through ability: :read, relationship: :account_marked_tasks
  end

  def custom_id
    "custom-#{model.id}"
  end

  def permitted_params(arg)
    arg.params.require(:task).permit(:finished, :name, :priority, :project_id, :state, :task, :user_id)
  end
end
