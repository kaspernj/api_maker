class Resources::WorkplaceResource < Resources::ApplicationResource
  self.model_class_name = "WorkerPlugins::Workplace"

  attributes :id
  collection_commands :destroy_links, :create_link, :current, :link_for, :switch_query_on_workplace
  member_commands(
    :add_collection,
    :delete_all_links
  )
  relationships :workplace_links

  def abilities
    can [:create_link, :current, :switch_query_on_workplace], WorkerPlugins::Workplace

    if signed_in?
      can(
        [:add_collection, :delete_all_links, :destroy_links, :event_workplace_links_created, :event_workplace_links_destroyed, :link_for, :read],
        WorkerPlugins::Workplace,
        user_id: current_user.id,
        user_type: "User"
      )
    end
  end
end
