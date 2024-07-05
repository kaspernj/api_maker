class Services::Devise::SignIn < ApiMaker::BaseService
  include Devise::Controllers::Rememberable

  def perform
    fail! "Devise sign in isn't enabled", type: :devise_sign_in_isnt_enabled unless ApiMaker::Configuration.current.devise_sign_in_enabled

    check_model_exists
    check_serializer_exists

    if !model.active_for_authentication?
      fail! inactive_message, type: :inactive
    elsif model.valid_password?(args[:password])
      controller.sign_in(model, scope:)
      remember_me(model) if args.dig(:args, :rememberMe)
      reset_current_ability
      succeed!(model: sign_in_model_result)
    else
      fail! invalid_error_message, type: :invalid
    end
  end

  def check_model_exists
    error_msg = I18n.t("devise.failure.not_found_in_database", authentication_keys: model_class.authentication_keys.join(", "))
    fail! error_msg, type: :not_found_in_database unless model
  end

  def check_serializer_exists
    fail! "Serializer doesn't exist for #{scope}", type: :serializer_doesnt_exist unless resource
  end

  def inactive_message
    message = model.inactive_message
    message = I18n.t("devise.failure.#{message}") if message.is_a?(Symbol)
    message
  end

  def invalid_error_message
    I18n.t("devise.failure.invalid", authentication_keys: model_class.authentication_keys.join(", "))
  end

  def model
    @model ||= model_class.find_for_authentication(email: args[:username])
  end

  def model_class
    @model_class ||= scope.camelize.safe_constantize
  end

  def scope
    @scope ||= args.dig(:args, :scope).presence || "user"
  end

  def resource
    @resource ||= ApiMaker::Serializer.resource_for(model.class)
  end

  def serializer
    @serializer ||= ApiMaker::Serializer.new(ability: current_ability, api_maker_args:, model:)
  end

  def sign_in_model_result
    @sign_in_model_result ||=
      if (load_query = args.dig(:args, :loadQuery))
        ApiMaker::CollectionSerializer.new(
          ability: current_ability,
          api_maker_args:,
          collection: [model],
          locals: api_maker_locals,
          model_class: model.class,
          query_params: load_query.query_params
        )
      else
        model
      end
  end
end
