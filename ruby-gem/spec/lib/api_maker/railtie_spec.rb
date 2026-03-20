require "rails_helper"

describe ApiMaker::Railtie do
  it "adds the session shadow middleware after the cookie store" do
    middleware_classes = Rails.application.middleware.map(&:klass)
    cookie_store_index = middleware_classes.index(ActionDispatch::Session::CookieStore)
    session_shadow_index = middleware_classes.index(ApiMaker::SessionShadowMiddleware)

    expect(cookie_store_index).to be_present
    expect(session_shadow_index).to eq(cookie_store_index + 1)
  end
end
