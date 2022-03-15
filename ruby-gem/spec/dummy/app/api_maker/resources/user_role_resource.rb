class Resources::UserRoleResource < Resources::ApplicationResource
  self.model_class = User::Role

  attributes :id, :role, :user_id
  relationships :user

  def abilities
    can READ, UserRole, user_id: current_user.id if signed_in?
  end
end
