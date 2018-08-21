class ApiMaker::DeviseController < ApiMaker::BaseController
  def do_sign_in
    scope = params.dig(:args, :scope).presence || "user"
    class_name = scope.camelize
    class_instance = class_name.constantize

    model = class_instance.find_for_authentication(email: params[:username])
    serializer = ActiveModel::Serializer.get_serializer_for(model.class)

    return render json: {success: false}, status: :unprocessable_entity unless serializer

    if model.valid_password?(params[:password])
      Devise::Controllers::SignInOut.sign_in(model, scope: scope)
      render json: {success: true, model_data: serializer}
    else
      render json: {success: false}, status: :unprocessable_entity
    end
  end

  def do_sign_out
    scope = params.dig(:args, :scope).presence || "user"
    Devise::Controllers::SignInOut.sign_out(scope: scope)
    render json: {success: true}
  end
end
