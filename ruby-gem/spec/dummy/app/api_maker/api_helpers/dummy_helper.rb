module ApiHelpers::DummyHelper
  def current_user
    @current_user ||= api_maker_args&.dig(:current_user)
  end
end
