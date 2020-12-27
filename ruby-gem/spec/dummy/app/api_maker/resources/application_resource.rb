class Resources::ApplicationResource < ApiMaker::BaseResource
  def current_user
    @current_user ||= api_maker_args&.dig(:current_user)
  end

  def signed_in?
    current_user.present?
  end
end
