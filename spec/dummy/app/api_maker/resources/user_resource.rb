class Resources::UserResource < Resources::ApplicationResource
  attributes :id, :email, :created_at, :custom_attribute

  def custom_attribute
    "CustomAttribute - Test arg: #{args[:test_arg]}"
  end
end
