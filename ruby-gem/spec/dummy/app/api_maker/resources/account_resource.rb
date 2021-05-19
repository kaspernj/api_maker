class Resources::AccountResource < Resources::ApplicationResource
  attributes :id, :name
  attributes :users_count, selected_by_default: false
  relationships :projects, :tasks

  def abilities
    can CRUD, Account
    can :sum, Account if current_user
  end

  def permitted_params(arg)
    arg.params.require(:account).permit(:name, task_ids: [])
  end

  def users_count
    model.users.count
  end
end
