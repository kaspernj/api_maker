class ApiMaker::ActionCableRequestContext
  attr_reader :api_maker_args, :api_maker_locals, :channel, :request_fingerprint

  delegate :current_user, to: :channel

  def initialize(api_maker_args:, channel:, request_fingerprint:)
    @api_maker_args = api_maker_args.merge(controller: self)
    @api_maker_locals = channel.api_maker_locals
    @channel = channel
    @request_fingerprint = request_fingerprint
  end

  def cookies
    request.cookie_jar
  end

  def form_authenticity_token
    @form_authenticity_token ||= begin
      session_statuses_controller = ApiMaker::SessionStatusesController.new
      session_statuses_controller.set_request!(request)
      session_statuses_controller.set_response!(ActionDispatch::Response.new)
      session_statuses_controller.__send__(:form_authenticity_token)
    end
  end

  def current_ability
    @current_ability ||= ApiMaker::Configuration.current.ability_class.new(api_maker_args:, locals: api_maker_locals)
  end

  def sign_in(model, scope: nil)
    scope_to_use = scope || Devise::Mapping.find_scope!(model)

    warden.set_user(model, scope: scope_to_use)
    update_connection_current_user(model, scope_to_use)
    run_sign_in_hooks(model, scope_to_use)
    reset_current_ability
  end

  def sign_out(model)
    scope_to_use = Devise::Mapping.find_scope!(model)

    warden.logout(scope_to_use)
    update_connection_current_user(nil, scope_to_use)
    run_sign_out_hooks(model, scope_to_use)
    reset_current_ability
  end

  def with_request_context(&)
    load_session_state
    locale = resolved_locale
    time_zone = resolved_time_zone

    session[:locale] = locale if locale
    persist_time_zone(time_zone)

    if locale
      I18n.with_locale(locale) do
        with_channel_request_context do
          with_time_zone(time_zone, &)
        end
      end
    else
      with_channel_request_context do
        with_time_zone(time_zone, &)
      end
    end
  ensure
    persist_session_state
  end

  def request
    @request ||=
      if channel.connection.respond_to?(:request)
        channel.connection.request
      else
        ActionDispatch::Request.new(channel.connection.env)
      end
  end

  def session
    if channel.connection.respond_to?(:request)
      channel.connection.request.session
    else
      channel.connection.env.fetch("rack.session")
    end
  end

  def reset_current_ability
    @current_ability = nil
  end

  def session_status_result
    ApiMaker::SessionStatusResult.new(controller: self).result
  end

  def shadow_session_token
    ApiMaker::SessionShadowStore.signed_token_for(request:)
  end

  def transmit_command_event(command_id:, payload:, type:)
    return unless channel.respond_to?(:transmit_command_event)

    channel.transmit_command_event(command_id:, payload:, request_fingerprint:, type:)
  end

private

  def warden
    channel.connection.env.fetch("warden")
  end

  def with_time_zone(time_zone, &)
    return yield unless time_zone

    Time.use_zone(time_zone, &)
  end

  def with_channel_request_context(&)
    if channel.respond_to?(:with_request_context)
      channel.with_request_context(api_maker_args:, &)
    else
      yield
    end
  end

  def update_connection_current_user(user, scope)
    return unless scope.to_sym == :user

    api_maker_args[:current_user] = user
    return channel.update_api_maker_current_user!(user) if channel.respond_to?(:update_api_maker_current_user!)

    channel.connection.current_user = user if channel.connection.respond_to?(:current_user=)
    channel.instance_variable_set(:@current_user, user)
  end

  def run_sign_in_hooks(model, scope)
    return unless channel.respond_to?(:after_sign_in)

    channel.after_sign_in(model:, scope:)
  end

  def run_sign_out_hooks(model, scope)
    return unless channel.respond_to?(:after_sign_out)

    channel.after_sign_out(model:, scope:)
  end

  def load_session_state
    ApiMaker::SessionShadowStore.load!(request:)
  end

  def persist_session_state
    ApiMaker::SessionShadowStore.persist!(request:)
  end

  def resolved_locale
    locale = api_maker_args[:locale].presence || session[:locale].presence

    return unless locale

    locale = locale.to_s
    return unless I18n.available_locales.map(&:to_s).include?(locale)

    locale
  end

  def resolved_time_zone
    time_zone_offset = time_zone_offset_number

    return unless time_zone_offset

    ActiveSupport::TimeZone[time_zone_offset]
  end

  def persist_time_zone(time_zone)
    return unless time_zone
    return unless current_user
    return unless current_user.respond_to?(:time_zone_name)
    return unless current_user.respond_to?(:time_zone_offset)

    time_zone_offset = time_zone_offset_number
    return unless time_zone_offset
    return if current_user.time_zone_offset == time_zone_offset

    current_user.update_columns(time_zone_name: time_zone.tzinfo.name, time_zone_offset:) # rubocop:disable Rails/SkipsModelValidations
  end

  def time_zone_offset_number
    time_zone_offset = api_maker_args[:time_zone_offset].presence || cookies[:time_zone_offset].presence

    return unless time_zone_offset

    time_zone_offset.to_i
  end
end
