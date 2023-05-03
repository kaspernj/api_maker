class Resources::WorkplaceLinkResource < Resources::ApplicationResource
  self.model_class = WorkerPlugins::WorkplaceLink

  attributes :id, :resource_id, :resource_type

  def abilities
    can [:destroy, :read], workplace: {user_id: current_user.id, user_type: "User"} if signed_in?
  end
end
