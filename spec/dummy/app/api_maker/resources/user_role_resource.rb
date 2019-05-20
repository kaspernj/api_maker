class Resources::UserRoleResource < Resources::ApplicationResource
  self.model_class = User::Role

  attributes :id, :role, :user_id
  relationships :user
end
