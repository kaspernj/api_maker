class ApiMaker::SessionStatusResult
  attr_reader :controller

  def initialize(controller:)
    @controller = controller
  end

  def result
    scopes = {}

    Devise.mappings.each do |scope|
      klass = scope[1].class_name.safe_constantize
      param_key = klass.model_name.param_key
      model_pk = current_model_for_scope(scope_name: param_key)&.__send__(klass.primary_key)

      scopes[param_key] = {
        primary_key: model_pk,
        signed_in: signed_in_for_scope?(scope_name: param_key)
      }
    end

    {
      csrf_token:,
      devise: {
        timeout_in: Devise.timeout_in.to_i
      },
      shadow_session_token:,
      scopes:
    }
  end

private

  def csrf_token
    return unless controller.respond_to?(:form_authenticity_token, true)

    controller.__send__(:form_authenticity_token)
  end

  def shadow_session_token
    return unless controller.respond_to?(:shadow_session_token, true)

    controller.__send__(:shadow_session_token)
  end

  def current_model_for_scope(scope_name:)
    method_name = "current_#{scope_name}"

    if warden
      warden.user(scope_name.to_sym)
    elsif controller.respond_to?(method_name)
      controller.__send__(method_name)
    elsif controller.respond_to?(:current_user) && scope_name == "user"
      controller.current_user
    end
  end

  def signed_in_for_scope?(scope_name:)
    method_name = "#{scope_name}_signed_in?"

    if warden
      warden.authenticated?(scope_name.to_sym)
    elsif controller.respond_to?(method_name)
      controller.__send__(method_name)
    elsif controller.respond_to?(:current_user) && scope_name == "user"
      controller.current_user.present?
    else
      false
    end
  end

  def warden
    return unless controller.respond_to?(:request)

    controller.request.env["warden"]
  end
end
