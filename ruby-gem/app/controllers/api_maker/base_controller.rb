class ApiMaker::BaseController < ApplicationController
  protect_from_forgery with: :exception

  before_action :set_locale

  rescue_from Exception, with: :render_error

private

  def current_ability
    @current_ability ||= ApiMaker::Configuration.current.ability_class.new(api_maker_args:, locals: api_maker_locals)
  end

  def reset_current_ability
    @current_ability = nil
  end

  def api_maker_locals
    @api_maker_locals ||= {}
  end

  def render_error(error)
    if error.is_a?(ActionController::InvalidAuthenticityToken)
      render json: {
        message: error.message,
        success: false,
        type: :invalid_authenticity_token
      }
    else
      puts error.inspect
      puts Rails.backtrace_cleaner.clean(error.backtrace)

      logger.error error.inspect
      logger.error Rails.backtrace_cleaner.clean(error.backtrace).join("\n")

      raise error
    end
  end

  def set_locale
    return if session[:locale].blank?

    locale = session[:locale].to_s
    locale_exists = I18n.available_locales.map(&:to_s).include?(locale)

    I18n.locale = locale if locale_exists
  end
end
