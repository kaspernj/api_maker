class Services::Devise::Current < ApiMaker::BaseService
  def perform
    scope = args.dig(:args, :scope).presence || "user"
    current_model = controller.__send__(:"current_#{scope}")
    succeed!(current: current_model)
  end
end
