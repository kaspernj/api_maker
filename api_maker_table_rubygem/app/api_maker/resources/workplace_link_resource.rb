class Resources::WorkplaceLinkResource < Resources::ApplicationResource
  self.model_class_name = "WorkerPlugins::WorkplaceLink"

  attributes :id, :resource_id, :resource_type

  def abilities
    return unless signed_in?

    workplace_args = {user_id: current_user.id}
    workplace_args[:user_type] = "User" if WorkerPlugins::UserRelationshipPolymorphic.execute!

    can READ + [:destroy], WorkerPlugins::WorkplaceLink, workplace: workplace_args
  end
end
