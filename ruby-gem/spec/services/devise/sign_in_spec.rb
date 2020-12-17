require "rails_helper"

describe Services::Devise::SignIn do
  it "fails if not enabled" do
    ApiMaker::Configuration.current.devise_sign_in_enabled = false

    response = Services::Devise::SignIn.execute(args: {username: "test@example.com", password: "password"})

    expect(response.error_messages).to eq ["Devise sign in isn't enabled"]
    expect(response.error_types).to eq [:devise_sign_in_isnt_enabled]
  ensure
    ApiMaker::Configuration.current.devise_sign_in_enabled = true
  end
end
