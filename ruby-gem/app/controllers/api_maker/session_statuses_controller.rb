class ApiMaker::SessionStatusesController < ActionController::Base # rubocop:disable Rails/ApplicationController
  skip_before_action :verify_authenticity_token, raise: false

  def create
    scopes = {}
    result = {
      devise: {
        timeout_in: Devise.timeout_in.to_i
      },
      csrf_token: form_authenticity_token,
      scopes:
    }

    Devise.mappings.each do |scope|
      klass = scope[1].class_name.safe_constantize
      param_key = klass.model_name.param_key

      model_method_name = "current_#{param_key}"
      model = __send__(model_method_name)
      model_pk = model&.__send__(klass.primary_key)

      signed_in_method_name = "#{param_key}_signed_in?"
      signed_in = __send__(signed_in_method_name)

      scopes[param_key] = {
        primary_key: model_pk,
        signed_in:
      }
    end

    render json: result
  end
end
