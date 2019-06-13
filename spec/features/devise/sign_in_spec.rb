require "rails_helper"

describe "Devise sign in", :js do
  let!(:user) { create :user }

  it "works" do
    visit devise_specs_sign_in_path

    fill_in "email", with: user.email
    fill_in "password", with: "password.123"
    click_on "Sign in"

    wait_for_chrome { find("[data-controller='devise--sign-in']", visible: false)["data-success-response"].present? }

    response = JSON.parse(find("[data-controller='devise--sign-in']", visible: false)["data-success-response"])

    expect(response.dig("response", "success")).to eq true
    expect(response.dig("response", "model_data", "a", "email")).to eq user.email
  end
end
