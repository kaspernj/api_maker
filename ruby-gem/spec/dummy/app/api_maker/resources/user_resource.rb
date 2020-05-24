class Resources::UserResource < Resources::ApplicationResource
  attributes :birthday_at, :id, :email, :created_at, :custom_attribute
  attributes :updated_at, if: :email_kasper?

  relationships :tasks

  def abilities
    can CRUD, User
  end

  def permitted_params(arg)
    arg.params.require(:user).permit(
      :email,
      tasks_attributes: [
        :id, :name, :project_id,
        project_attributes: [:account_id, :id, :name]
      ]
    )
  end

  def custom_attribute
    "CustomAttribute - Test arg: #{args[:test_arg]}"
  end

  def email_kasper?
    model.email == "kasper@example.com"
  end
end
