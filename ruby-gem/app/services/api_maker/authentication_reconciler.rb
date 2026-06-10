# Compares the user ids the frontend believes it is signed in as (sent in the
# request's global data as `believed_devise_user_ids`) against the actually
# authenticated user for each Devise scope.
#
# A divergence means the frontend's session belief is stale — the session
# expired, was signed out, or switched accounts — so running the request as-is
# would produce misleading "not found / no access" errors. Callers use this to
# short-circuit with a dedicated `authentication_changed` response instead.
#
# The believed ids are used ONLY to detect divergence against the
# server-authoritative user. They never grant access.
class ApiMaker::AuthenticationReconciler
  def self.diverged?(believed_user_ids:, actual_user_id_for:)
    new(believed_user_ids:, actual_user_id_for:).diverged?
  end

  # @param believed_user_ids [Hash, nil] scope name => believed user id, as sent
  #   by the frontend. Anything that is not a Hash is treated as "no belief".
  # @param actual_user_id_for [#call] receives a scope name (String) and returns
  #   the actually authenticated user id for that scope (or nil when signed out).
  def initialize(believed_user_ids:, actual_user_id_for:)
    @believed_user_ids = believed_user_ids
    @actual_user_id_for = actual_user_id_for
  end

  def diverged?
    believed_pairs.any? do |scope, believed_id|
      @actual_user_id_for.call(scope).to_s != believed_id.to_s
    end
  end

private

  def believed_pairs
    return [] unless @believed_user_ids.is_a?(Hash)

    @believed_user_ids.filter_map do |scope, believed_id|
      next if believed_id.nil? || believed_id.to_s.empty?

      [scope.to_s, believed_id]
    end
  end
end
