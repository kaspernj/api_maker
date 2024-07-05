class ApplicationController < ActionController::Base
private

  def api_maker_args
    @api_maker_args ||= {}
    @api_maker_args[current_user&.id || "anon"] ||= {current_user:}
  end

  def current_ability
    @current_ability ||= {}
    @current_ability[current_user&.id || "anon"] ||= ::ApiMaker::Ability.new(api_maker_args:)
  end
end
