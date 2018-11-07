class ApplicationController < ActionController::Base
private

  def api_maker_args
    @api_maker_args ||= {current_user: current_user}
  end

  def current_ability
    @current_ability ||= ::ApiMakerAbility.new(args: api_maker_args)
  end
end
