require "rails_helper"

describe ApiMaker::Railtie do
  it "adds the session shadow middleware after the cookie store" do
    middleware_classes = Rails.application.middleware.map(&:klass)
    cookie_store_index = middleware_classes.index(ActionDispatch::Session::CookieStore)
    session_shadow_index = middleware_classes.index(ApiMaker::SessionShadowMiddleware)

    expect(cookie_store_index).to be_present
    expect(session_shadow_index).to eq(cookie_store_index + 1)
  end

  it "finds the configured session middleware without assuming cookie store" do
    expect(described_class.session_middleware_class(ActionDispatch::Session::CacheStore)).to eq(ActionDispatch::Session::CacheStore)
  end

  it "defaults to the cookie store when no explicit session store is configured" do
    expect(described_class.session_middleware_class(nil)).to eq(ActionDispatch::Session::CookieStore)
  end

  it "returns nil when the given class is not a session store" do
    expect(described_class.session_middleware_class(ApiMaker::SessionShadowMiddleware)).to be_nil
  end
end
