class ApiMaker::DeviseController < ApiMaker::BaseController
  include Devise::Controllers::Rememberable

  def do_sign_in
    scope = params.dig(:args, :scope).presence || "user"
    class_name = scope.camelize
    class_instance = class_name.constantize

    model = class_instance.find_for_authentication(email: params[:username])
    return render json: {success: false}, status: :unprocessable_entity unless model
    serializer = ActiveModel::Serializer.get_serializer_for(model.class)
    return render json: {success: false}, status: :unprocessable_entity unless serializer

    if !model.active_for_authentication?
      render json: {success: false, errors: [model.inactive_message]}, status: :unprocessable_entity
    elsif model.valid_password?(params[:password])
      sign_in(model, scope: scope)
      remember_me(model) if params.dig(:args, :rememberMe)
      render json: {success: true, model_data: serializer.new(model)}
    else
      render json: {success: false}, status: :unprocessable_entity
    end
  end

  def do_sign_out
    scope = params.dig(:args, :scope).presence || "user"
    current_model = __send__("current_#{scope}")
    sign_out current_model
    render json: {success: true}
  end
end
