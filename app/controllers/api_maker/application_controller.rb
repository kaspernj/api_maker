class ApiMaker::ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

private

  def current_ability
    @current_ability ||= ApiMakerAbility.new(controller: controller)
  end
end
