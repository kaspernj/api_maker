class ApiMaker::BaseController < ActionController::Base
  protect_from_forgery with: :exception

private

  def current_ability
    @current_ability ||= ::ApiMakerAbility.new(controller: self)
  end
end
