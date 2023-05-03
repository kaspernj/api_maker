class Resources::WorkplaceResource < Resources::ApplicationResource
  self.model_class = WorkerPlugins::Workplace

  attributes :id
  collection_commands :destroy_links, :create_link, :current, :link_for, :switch_query_on_workplace
  member_commands(
    :delete_all_links,
    :merge_contacts,
    :soft_delete,
    :state_call,
    :un_soft_delete
  )
  relationships :workplace_links

  def abilities
    can [:create_link, :current, :state_call, :switch_query_on_workplace], WorkerPlugins::Workplace

    if signed_in?
      can(
        [:add_relationship_to_workplace, :delete_all_links, :destroy_links, :event_workplace_links_created, :event_workplace_links_destroyed, :link_for, :read],
        WorkerPlugins::Workplace,
        user_id: current_user.id,
        user_type: "User"
      )
    end
  end
end
