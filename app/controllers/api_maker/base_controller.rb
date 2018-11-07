class ApiMaker::BaseController < ApplicationController
  protect_from_forgery with: :exception

  before_action :set_locale

  rescue_from Exception, with: :render_error

private

  def current_ability
    @current_ability ||= ::ApiMakerAbility.new(args: api_maker_args)
  end

  def render_error(error)
    puts error.inspect
    puts error.backtrace

    logger.error error.inspect
    logger.error error.backtrace.join("\n")

    raise error
  end

  def set_locale
    return if session[:locale].blank?

    locale = session[:locale].to_s
    locale_exists = I18n.available_locales.map(&:to_s).include?(locale)

    I18n.locale = locale if locale_exists
  end
end
