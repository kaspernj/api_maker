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

  it "returns session status after sign in" do
    user = create(:user, email: "test@example.com", password: "password", password_confirmation: "password")
    session_status_result = {scopes: {"user" => {signed_in: true}}}
    session_status = instance_double(ApiMaker::SessionStatusResult, result: session_status_result)
    controller = instance_double(
      ApiMaker::ActionCableRequestContext,
      reset_current_ability: nil,
      sign_in: nil
    )
    expect(ApiMaker::SessionStatusResult).to receive(:new).with(controller:).and_return(session_status)

    response = Services::Devise::SignIn.execute(
      args: {username: user.email, password: "password"},
      controller:
    )

    expect(response.result).to include(session_status: session_status_result)
  end
end
