require "rails_helper"

describe "Devise sign in" do
  let!(:user) { create :user }

  it "works" do
    login_as user

    visit devise_specs_sign_out_path

    click_on "Sign out"

    wait_for_chrome { find("[data-controller='devise--sign-out']", visible: false)["data-success-response"].present? }

    response = JSON.parse(find("[data-controller='devise--sign-out']", visible: false)["data-success-response"])

    expect(response.fetch("deviseSignOutResponse").fetch("success")).to eq true
    expect(response.fetch("currentUserResult")).to eq nil
    expect(response.fetch("isUserSignedInResult")).to eq false
  end
end
