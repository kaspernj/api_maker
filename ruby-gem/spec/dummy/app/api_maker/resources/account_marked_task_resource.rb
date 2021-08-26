class Resources::AccountMarkedTaskResource < Resources::ApplicationResource
  attributes :account_id, :id, :task_id
  relationships :account, :task

  def abilities
    can READ, AccountMarkedTask if current_user&.admin?

    can :read, AccountMarkedTask, ["account_marked_tasks.id = 5"] do |account_marked_task|
      account_marked_task.id == 5
    end
  end
end
