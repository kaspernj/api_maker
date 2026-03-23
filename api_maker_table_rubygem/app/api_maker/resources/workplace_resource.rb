# frozen_string_literal: true

# Kept in compact form because host apps may define `Resources` as a class.
# ApiMaker resource for private workplaces.
class Resources::WorkplaceResource < Resources::ApplicationResource
  COLLECTION_ABILITIES = %i[create_link current switch_query_on_workplace].freeze
  USER_ABILITIES = READ + %i[
    add_query
    delete_all_links
    destroy_links
    event_workplace_links_created
    event_workplace_links_destroyed
    link_for
    query_links_status
    remove_query
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
    owner_args = workplace_owner_args
    return unless owner_args

    can COLLECTION_ABILITIES, WorkerPlugins::Workplace
    can USER_ABILITIES, WorkerPlugins::Workplace, owner_args
  end

  private

  def current_session_id
    api_maker_args[:current_session_id]
  end

  def workplace_owner_args
    if signed_in?
      args = {user_id: current_user.id}
      args[:user_type] = "User" if WorkerPlugins::UserRelationshipPolymorphic.execute!
      args
    elsif current_session_id.present?
      {session_id: current_session_id}
    end
  end
end
