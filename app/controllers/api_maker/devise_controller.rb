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
      render json: {success: false, errors: [t("devise.failure.invalid")]}, status: :unprocessable_entity
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
    render json: {success: false, errors: [t("devise.failure.not_found_in_database", authentication_keys: model_class.authentication_keys.join(", "))]}, status: :unprocessable_entity unless model
  end

  def check_serializer_exists
    render json: {success: false, errors: ["Serializer doesn't exist for #{scope}"]}, status: :unprocessable_entity unless resource
  end

  def model
    @model ||= model_class.find_for_authentication(email: params[:username])
  end

  def model_class
    @model_class ||= scope.camelize.safe_constantize
  end

  def scope
    @scope ||= params.dig(:args, :scope).presence || "user"
  end

  def resource
    @resource ||= ApiMaker::Serializer.resource_for(model.class)
  end

  def serializer
    @serializer ||= ApiMaker::Serializer.new(ability: current_ability, args: api_maker_args, model: model)
  end
end
