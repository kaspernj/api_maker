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

  it "returns session status after sign out" do
    user = create(:user)
    controller = instance_double(
      ApiMaker::ActionCableRequestContext,
      current_user: user,
      session_status_result: {scopes: {"user" => {signed_in: false}}},
      sign_out: nil
    )

    allow(controller).to receive(:current_user).and_return(user)

    response = Services::Devise::SignOut.execute(
      args: {args: {scope: "user"}},
      controller:
    )

    expect(response.result).to include(session_status: {scopes: {"user" => {signed_in: false}}})
  end
end
