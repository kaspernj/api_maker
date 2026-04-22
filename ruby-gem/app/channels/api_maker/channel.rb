class ApiMaker::Channel < ActionCable::Channel::Base
  delegate :authorize!, :can?, to: :current_ability

  def api_maker_locals
    @api_maker_locals ||= {}
  end

  def current_ability
    sync_api_maker_current_user!

    @current_ability ||= ApiMaker::Configuration.current.ability_class.new(
      api_maker_args: {
        current_user:,
        current_session_id:,
        layout: params.dig(:global, :layout)
      },
      locals: api_maker_locals
    )
  end

  def current_user
    sync_api_maker_current_user!
  end

  def current_session_id
    @current_session_id ||= ApiMaker::SessionShadowStore.session_id_for(request: current_request)
  end

  def load_session_state(request:)
    ApiMaker::SessionShadowStore.load!(request:)
  end

  def persist_session_state(request:)
    ApiMaker::SessionShadowStore.persist!(request:)
  end

  def reset_current_ability
    @current_ability = nil
  end

  def update_api_maker_current_user!(current_user)
    previous_user = defined?(@current_user) ? @current_user : nil

    @current_user = current_user
    connection.current_user = current_user if connection.respond_to?(:current_user=)
    reset_current_ability
    handle_api_maker_current_user_change(previous_user:, current_user:)

    @current_user
  end

  # Reconciles the channel's cached current_user with the authoritative
  # in-memory sources on the connection. Reads `connection.current_user`
  # (set by ActionCable `identified_by :current_user` and mutated by
  # `sign_in(model)` inside `ApiMaker::ActionCableRequestContext`) and falls
  # back to `env["warden"]&.user(:user)` — the warden proxy's in-memory
  # `@users[:user]`, which `warden.set_user` updates during
  # `Devise::PersistSession` on the cable.
  #
  # Call this from custom `with_request_context` overrides that want to
  # force a pre-command refresh. Do NOT read `warden.session_serializer`
  # directly — the rack session captured at cable upgrade is not refreshed
  # when a user signs in mid-connection over HTTP, so reading that source
  # will clobber a valid signed-in user with nil.
  def sync_api_maker_current_user!
    synced_current_user = if connection.respond_to?(:current_user) && connection.current_user.present?
      connection.current_user
    else
      connection.env["warden"]&.user(:user)
    end

    return @current_user if defined?(@current_user) && @current_user == synced_current_user

    update_api_maker_current_user!(synced_current_user)
  end

private

  def current_request
    if connection.respond_to?(:request)
      connection.request
    else
      ActionDispatch::Request.new(connection.env)
    end
  end

  def handle_api_maker_current_user_change(previous_user:, current_user:); end
end
