class Resources::AccountResource < Resources::ApplicationResource
  attributes :id, :name
  relationships :projects, :tasks

  def abilities
    can CRUD, Account
  end

  def permitted_params(arg)
    arg.params.require(:account).permit(task_ids: [])
  end
end
