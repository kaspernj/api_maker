require "rails_helper"

describe "Devise sign in" do
  let!(:user) { create :user }

  it "signs in" do
    login_as user

    visit devise_specs_sign_out_path

    click_on "Sign out"

    wait_for_browser { find("[data-controller='devise--sign-out']", visible: false)["data-success-response"].present? }

    response = JSON.parse(find("[data-controller='devise--sign-out']", visible: false)["data-success-response"])

    expect(response.dig!("deviseSignOutResponse", "success")).to be true
    expect(response.fetch("currentUserResult")).to be_nil
    expect(response.fetch("isUserSignedInResult")).to be false
  end
end
