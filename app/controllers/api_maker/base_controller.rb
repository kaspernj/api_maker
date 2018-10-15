class ApiMaker::BaseController < ActionController::Base
  protect_from_forgery with: :exception

  before_action :set_locale

private

  def current_ability
    @current_ability ||= ::ApiMakerAbility.new(controller: self)
  end

  def set_locale
    return if session[:locale].blank?

    locale = session[:locale].to_s
    locale_exists = I18n.available_locales.map(&:to_s).include?(locale)

    I18n.locale = locale if locale_exists
  end
end
