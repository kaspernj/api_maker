require "rails_helper"

describe "Devise sign in", :js do
  let!(:user) { create :user, email: "test@example.com" }

  it "works" do
    visit devise_specs_sign_in_path

    fill_in "email", with: "test@example.com"
    fill_in "password", with: "password.123"
    click_on "Sign in"

    wait_for_chrome { find("[data-controller='devise--sign-in']", visible: false)["data-success-response"].present? }

    response = JSON.parse(find("[data-controller='devise--sign-in']", visible: false)["data-success-response"])
    current_user_data = JSON.parse(execute_script "return document.querySelector('.api-maker-data').dataset.currentUser")

    expect(response.dig("response", "success")).to eq true
    expect(response.dig("response", "model_data", "a", "email")).to eq user.email
    expect(current_user_data).to match hash_including("type" => "users", "a" => hash_including("email" => "test@example.com"))
  end
end
