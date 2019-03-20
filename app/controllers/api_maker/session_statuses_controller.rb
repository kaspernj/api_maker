class ApiMaker::SessionStatusesController < ApiMaker::BaseController
  skip_before_action :verify_authenticity_token

  def create
    result = {
      csrf_param: request_forgery_protection_token,
      csrf_token: form_authenticity_token
    }

    render json: result
  end
end
