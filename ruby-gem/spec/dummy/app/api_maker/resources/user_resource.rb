class Resources::UserResource < Resources::ApplicationResource
  attribute :name, requires_columns: [:first_name, :last_name]
  attributes :birthday_at, :created_at, :custom_attribute, :email, :first_name, :id, :last_name
  attributes :updated_at, if: :email_kasper?

  relationships :supported_tasks, :tasks, :user_roles

  def abilities
    can :read, User
    can CRUD, User
  end

  def permitted_params(arg)
    arg.params.require(:user).permit(
      :email,
      tasks_attributes: [
        :id, :name, :project_id,
        project_attributes: [:account_id, :id, :illegal, :name]
      ]
    )
  end

  def custom_attribute
    "CustomAttribute - Test arg: #{api_maker_args[:test_arg]}"
  end

  def email_kasper?
    model.email == "kasper@example.com"
  end
end
