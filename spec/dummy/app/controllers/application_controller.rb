class ApplicationController < ActionController::Base
private

  def current_ability
    @current_ability ||= ::ApiMakerAbility.new(controller: self)
  end
end
