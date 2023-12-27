class Resources::WorkplaceResource < Resources::ApplicationResource
  USER_ABILITIES = [
    :add_query,
    :delete_all_links,
    :destroy_links,
    :event_workplace_links_created,
    :event_workplace_links_destroyed,
    :link_for,
    :read,
    :query_links_status,
    :remove_query
  ].freeze

  self.model_class_name = "WorkerPlugins::Workplace"

  attributes :id
  collection_commands :destroy_links, :create_link, :current, :link_for, :switch_query_on_workplace
  member_commands(
    :add_query,
    :delete_all_links,
    :query_links_status,
    :remove_query
  )
  relationships :workplace_links

  def abilities
    can [:create_link, :current, :switch_query_on_workplace], WorkerPlugins::Workplace

    if signed_in?
      workplace_args = {user_id: current_user.id}
      workplace_args[:user_type] = "User" if WorkerPlugins::UserRelationshipPolymorphic.execute!

      can USER_ABILITIES, WorkerPlugins::Workplace, workplace_args
    end
  end
end
