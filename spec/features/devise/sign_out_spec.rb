require "rails_helper"

describe "Devise sign in", :js do
  let!(:user) { create :user }

  it "works" do
    login_as user

    visit devise_specs_sign_out_path

    click_on "Sign out"

    WaitUtil.wait_for_condition("user to be signed out") do
      find("[data-controller='devise--sign-out']", visible: false)["data-success-response"] != nil
    end

    response = JSON.parse(find("[data-controller='devise--sign-out']", visible: false)["data-success-response"])

    expect(response.dig("success")).to eq true
  end
end
