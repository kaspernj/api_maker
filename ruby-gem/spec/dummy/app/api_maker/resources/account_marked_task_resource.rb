class Resources::AccountMarkedTaskResource < Resources::ApplicationResource
  attributes :id

  def abilities
    can :read, AccountMarkedTask, ["account_marked_tasks.id = 5"] do |account_marked_task|
      account_marked_task.id == 5
    end
  end
end
