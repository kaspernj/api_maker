require "rails_helper"

describe "Devise sign in" do
  let!(:user) { create :user, email: "test@example.com" }
  let(:user_role) { create :user_role, role: "partner", user: }

  it "signs in" do
    visit devise_specs_sign_in_path

    fill_in "email", with: "test@example.com"
    fill_in "password", with: "password.123"
    click_on "Sign in"

    wait_for_browser { wait_for_and_find("[data-controller='devise--sign-in']", visible: false)["data-success-response"].present? }

    response = JSON.parse(wait_for_and_find("[data-controller='devise--sign-in']", visible: false)["data-success-response"])

    expect(response.dig!("deviseSignInResponse", "response", "model", "modelData", "email")).to eq user.email
    expect(response.dig!("currentUserResult", "modelData", "id")).to eq user.id
    expect(response.dig!("currentUserResult")).not_to have_key "preloadedRelationships"
    expect(response.fetch("isUserSignedInResult")).to be true
  end

  it "signs in and sets current user with preloads" do
    user_role

    visit devise_specs_sign_in_path(current_user_with_preloads: true)

    fill_in "email", with: "test@example.com"
    fill_in "password", with: "password.123"
    click_on "Sign in"

    wait_for_browser { wait_for_and_find("[data-controller='devise--sign-in']", visible: false)["data-success-response"].present? }

    response = JSON.parse(wait_for_and_find("[data-controller='devise--sign-in']", visible: false)["data-success-response"])

    expect(response.dig!("deviseSignInResponse", "response", "model", 0, "modelData", "email")).to eq user.email
    expect(response.dig!("currentUserResult", "modelData", "id")).to eq user.id
    expect(response.dig!("currentUserResult", "preloadedRelationships")).to eq("user_roles" => [user_role.id])
    expect(response.fetch("isUserSignedInResult")).to be true
  end
end
