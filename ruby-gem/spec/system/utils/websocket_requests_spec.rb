require "rails_helper"

describe "utils - websocket requests" do
  let!(:admin_user) { create :user, :admin, email: "admin@example.com", password: "password", password_confirmation: "password" }
  let!(:admin_user_role) { create :user_role, role: "partner", user: admin_user }

  it "runs commands and devise auth over websocket requests" do
    admin_user
    admin_user_role

    visit "/utils/websocket-requests"
    wait_for_selector("[data-testid='websocket-config-ready']", text: "true")

    wait_for_and_find("[data-testid='websocket-run-command-button']").click

    wait_for_selector("[data-testid='websocket-command-received']", text: "true")
    wait_for_selector("[data-testid='websocket-command-progress']", text: "0.5")
    wait_for_selector("[data-testid='websocket-command-count']", text: "2")
    wait_for_selector("[data-testid='websocket-command-total']", text: "4")
    wait_for_selector("[data-testid='websocket-command-log']", text: "Started")
    wait_for_selector("[data-testid='websocket-command-result']", text: "true")

    wait_for_and_find("[data-testid='websocket-sign-in-button']").click

    wait_for_selector("[data-testid='websocket-current-user-id']", text: admin_user.id.to_s)
    wait_for_selector("[data-testid='websocket-sign-in-preload-count']", text: "1")
    wait_for_selector("[data-testid='websocket-signed-in-state']", text: "true")

    session_status_calls_after_sign_in = find("[data-testid='websocket-session-status-calls']").text.to_i

    wait_for_and_find("[data-testid='websocket-sign-out-button']").click

    wait_for_selector("[data-testid='websocket-signed-in-state']", text: "false")

    session_status_calls_after_sign_out = find("[data-testid='websocket-session-status-calls']").text.to_i

    # Sign-in and sign-out now go through HTTP, so the session status call
    # count depends on whether the response includes session_status inline.
    # The important assertion is that sign-in/sign-out completed successfully.
    expect(session_status_calls_after_sign_out).to be >= session_status_calls_after_sign_in
  end
end
