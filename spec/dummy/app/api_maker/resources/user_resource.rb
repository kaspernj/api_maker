class Resources::UserResource < Resources::ApplicationResource
  attributes :birthday_at, :id, :email, :created_at, :custom_attribute
  attributes :updated_at, if: :email_kasper?

  def custom_attribute
    "CustomAttribute - Test arg: #{args[:test_arg]}"
  end

  def email_kasper?
    model.email == "kasper@example.com"
  end
end
