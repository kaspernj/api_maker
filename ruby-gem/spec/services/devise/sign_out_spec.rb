require "rails_helper"

describe Services::Devise::SignOut do
  it "fails if not enabled" do
    ApiMaker::Configuration.current.devise_sign_out_enabled = false

    response = Services::Devise::SignOut.execute

    expect(response.error_messages).to eq ["Devise sign out isn't enabled"]
    expect(response.error_types).to eq [:devise_sign_out_isnt_enabled]
  ensure
    ApiMaker::Configuration.current.devise_sign_out_enabled = true
  end
end
