require "rails_helper"

describe "devise - events" do
  let(:admin_user) { create :user, :admin, email: "admin@example.com", password: "password", password_confirmation: "password" }
  let!(:task) { create :task, name: "Initial subscribed task", user: admin_user }

  it "emits sign in and sign out events" do
    admin_user
    visit devise_events_path

    wait_for_selector "[data-testid='devise-subscription-connected']", exact_text: "true"
    wait_for_selector "[data-testid='devise-subscription-update-count']", exact_text: "0"
    wait_for_selector "[data-testid='devise-sign-in-count']", exact_text: "0"
    wait_for_selector "[data-testid='devise-sign-out-count']", exact_text: "0"

    wait_for_and_find("[data-testid='devise-sign-out-fail-button']").click
    wait_for_selector "[data-testid='devise-sign-out-count']", exact_text: "0"

    wait_for_and_find("[data-testid='devise-sign-in-button']").click
    wait_for_selector "[data-testid='devise-sign-in-count']", exact_text: "1"

    wait_for_and_find("[data-testid='devise-sign-out-button']").click
    wait_for_selector "[data-testid='devise-sign-out-count']", exact_text: "1"
  end

  it "keeps live subscriptions working while ignoring a disconnected stale pool during auth refresh" do
    admin_user
    visit devise_events_path

    wait_for_selector "[data-testid='devise-subscription-connected']", exact_text: "true"
    wait_for_selector "[data-testid='devise-subscription-update-count']", exact_text: "0"
    wait_for_selector "[data-testid='devise-sign-out-count']", exact_text: "0"
    wait_for_and_find("[data-testid='devise-sign-in-button']").click
    wait_for_selector "[data-testid='devise-sign-in-count']", exact_text: "1"
    wait_for_and_find("[data-testid='devise-subscribe-to-task-button']").click
    wait_for_selector "[data-testid='devise-subscribed-task-name']", exact_text: "Initial subscribed task"
    wait_for_selector "[data-testid='devise-task-subscription-connected']", exact_text: "true"
    wait_for_and_find("[data-testid='devise-add-disconnected-stale-pool-button']").click
    wait_for_and_find("[data-testid='devise-sign-out-button']").click
    wait_for_expect do
      expect(find("[data-testid='devise-sign-out-count']").text.to_i).to be >= 1
    end
    wait_for_and_find("[data-testid='devise-sign-in-button']").click
    wait_for_selector "[data-testid='devise-sign-in-count']", exact_text: "2"

    task_update_count_before = find("[data-testid='devise-task-update-count']").text.to_i

    wait_for_and_find("[data-testid='devise-trigger-task-update-button']").click
    wait_for_expect do
      expect(find("[data-testid='devise-subscribed-task-name']").text).to match(/Updated-\d+/)
    end
    wait_for_expect do
      expect(find("[data-testid='devise-task-update-count']").text.to_i).to be > task_update_count_before
    end
  end
end
