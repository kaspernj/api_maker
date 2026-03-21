class Services::Devise::PersistSession < ApiMaker::BaseService
  include Devise::Controllers::Rememberable

  def perform
    if args.key?(:signedIn) && !args[:signedIn]
      controller.sign_out(scope.to_sym)
    else
      sign_in_current_model_or_sign_out
    end

    succeed!(session_status: ApiMaker::SessionStatusResult.new(controller:).result, success: true)
  end

  def current_model
    @current_model ||= current_model_from_warden || current_model_from_controller || current_model_from_session || current_model_from_shadow_session
  end

  def current_model_from_warden
    return unless warden

    warden.user(scope.to_sym)
  end

  def current_model_from_controller
    if controller.respond_to?(:"current_#{scope}")
      controller.__send__(:"current_#{scope}")
    elsif controller.respond_to?(:current_user) && scope == "user"
      controller.current_user
    end
  end

  def current_model_from_session
    return unless controller.respond_to?(:request)

    model_from_session_key(controller.request.session["warden.user.#{scope}.key"])
  end

  def current_model_from_shadow_session
    return if args[:shadowSessionToken].blank?

    shadow_session_data = ApiMaker::SessionShadowStore.read_signed(request: controller.request, token: args[:shadowSessionToken])
    return if shadow_session_data.blank?

    model_from_session_key(shadow_session_data["warden.user.#{scope}.key"])
  end

  def scope
    @scope ||= args[:scope].presence || "user"
  end

  def model_class
    @model_class ||= scope.camelize.safe_constantize
  end

  def model_from_session_key(session_key)
    primary_key = Array(Array(session_key).first).first

    return if primary_key.blank?

    model_class.find_by(model_class.primary_key => primary_key)
  end

  def sign_in_current_model_or_sign_out
    if current_model
      controller.sign_in(current_model, scope: scope.to_sym)
      remember_me(current_model) if args[:rememberMe]
    else
      controller.sign_out(scope.to_sym)
    end
  end

  def warden
    return unless controller.respond_to?(:request)

    controller.request.env["warden"]
  end
end
