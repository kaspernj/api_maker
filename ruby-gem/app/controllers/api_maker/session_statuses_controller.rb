class ApiMaker::SessionStatusesController < ActionController::Base # rubocop:disable Rails/ApplicationController
  skip_before_action :verify_authenticity_token, raise: false

  def create
    render json: ApiMaker::SessionStatusResult.new(controller: self).result
  end

  def shadow_session_token
    ApiMaker::SessionShadowStore.signed_token_for(request:)
  end
end
