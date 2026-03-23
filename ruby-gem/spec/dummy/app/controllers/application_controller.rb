class ApplicationController < ActionController::Base
private

  def api_maker_args
    @api_maker_args ||= {}
    current_session_id = ApiMaker::SessionShadowStore.session_id_for(request:)
    @api_maker_args[current_user&.id || current_session_id || "anon"] ||= {current_session_id:, current_user:}
  end

  def current_ability
    current_session_id = ApiMaker::SessionShadowStore.session_id_for(request:)
    @current_ability ||= {}
    @current_ability[current_user&.id || current_session_id || "anon"] ||= ::ApiMaker::Ability.new(api_maker_args:)
  end
end
