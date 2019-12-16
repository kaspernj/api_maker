require "rails_helper"

describe "Devise sign in" do
  let!(:user) { create :user, email: "test@example.com" }

  it "works" do
    visit devise_specs_sign_in_path

    fill_in "email", with: "test@example.com"
    fill_in "password", with: "password.123"
    click_on "Sign in"

    wait_for_browser { find("[data-controller='devise--sign-in']", visible: false)["data-success-response"].present? }

    response = JSON.parse(find("[data-controller='devise--sign-in']", visible: false)["data-success-response"])

    expect(response.fetch("deviseSignInResponse").fetch("response").fetch("success")).to eq true
    expect(response.fetch("deviseSignInResponse").fetch("response").fetch("model_data").fetch("a").fetch("email")).to eq user.email
    expect(response.fetch("currentUserResult").fetch("modelData").fetch("id")).to eq user.id
    expect(response.fetch("isUserSignedInResult")).to eq true
  end
end
