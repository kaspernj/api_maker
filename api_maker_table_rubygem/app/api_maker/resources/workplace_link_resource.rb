class Resources::WorkplaceLinkResource < Resources::ApplicationResource
  self.model_class_name = "WorkerPlugins::WorkplaceLink"

  attributes :id, :resource_id, :resource_type

  def abilities
    workplace_args = {user_id: current_user.id}
    workplace_args[:user_type] = "User" if WorkerPlugins::Workplace.columns_hash.key?("user_type")

    can [:destroy, :read], workplace: workplace_args if signed_in?
  end
end
