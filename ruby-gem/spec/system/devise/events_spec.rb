require "rails_helper"

describe "devise - events" do
  let(:admin_user) { create :user, :admin, email: "admin@example.com", password: "password", password_confirmation: "password" }

  it "emits sign in and sign out events" do
    admin_user
    visit devise_events_path

    wait_for_selector "[data-testid='devise-sign-in-count']", exact_text: "0"
    wait_for_selector "[data-testid='devise-sign-out-count']", exact_text: "0"

    wait_for_and_find("[data-testid='devise-sign-out-fail-button']").click
    wait_for_selector "[data-testid='devise-sign-out-count']", exact_text: "0"

    wait_for_and_find("[data-testid='devise-sign-in-button']").click
    wait_for_selector "[data-testid='devise-sign-in-count']", exact_text: "1"

    wait_for_and_find("[data-testid='devise-sign-out-button']").click
    wait_for_selector "[data-testid='devise-sign-out-count']", exact_text: "1"
  end
end
