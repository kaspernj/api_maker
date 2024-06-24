class Services::Devise::SignOut < ApiMaker::BaseService
  def perform
    fail! "Devise sign out isn't enabled", type: :devise_sign_out_isnt_enabled unless ApiMaker::Configuration.current.devise_sign_out_enabled
    scope = args.dig(:args, :scope).presence || "user"
    current_model = controller.__send__(:"current_#{scope}")
    controller.sign_out current_model
    succeed!(success: true)
  end
end
