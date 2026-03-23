# frozen_string_literal: true

# Kept in compact form because host apps may define `Resources` as a class.
# ApiMaker resource for workplace links.
class Resources::WorkplaceLinkResource < Resources::ApplicationResource
  self.model_class_name = "WorkerPlugins::WorkplaceLink"

  attributes :id, :resource_id, :resource_type

  def abilities
    owner_args = workplace_owner_args
    return unless owner_args

    can READ + [:destroy], WorkerPlugins::WorkplaceLink, workplace: owner_args
  end

  private

  def workplace_owner_args
    if signed_in?
      args = {user_id: current_user.id}
      args[:user_type] = "User" if WorkerPlugins::UserRelationshipPolymorphic.execute!
      args
    elsif api_maker_args[:current_session_id].present?
      {session_id: api_maker_args[:current_session_id]}
    end
  end
end
