class ApiMaker::DeviseController < ApiMaker::BaseController
  include Devise::Controllers::Rememberable

  before_action :check_model_exists, only: :do_sign_in
  before_action :check_serializer_exists, only: :do_sign_in

  def do_sign_in
    if !model.active_for_authentication?
      render json: {success: false, errors: [model.inactive_message]}, status: :unprocessable_entity
    elsif model.valid_password?(params[:password])
      sign_in(model, scope: scope)
      remember_me(model) if params.dig(:args, :rememberMe)
      render json: {success: true, model_data: serializer.result}
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

private

  def check_model_exists
    render json: {success: false}, status: :unprocessable_entity unless model
  end

  def check_serializer_exists
    render json: {success: false}, status: :unprocessable_entity unless resource
  end

  def model
    @model ||= proc do
      class_name = scope.camelize
      class_instance = class_name.constantize
      class_instance.find_for_authentication(email: params[:username])
    end.call
  end

  def scope
    @scope ||= params.dig(:args, :scope).presence || "user"
  end

  def resource
    @resource ||= ApiMaker::Serializer.resource_for(model.class)
  end

  def serializer
    @serializer ||= ApiMaker::Serializer.new(ability: current_ability, model: model)
  end
end
