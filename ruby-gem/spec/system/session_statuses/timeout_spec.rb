require "rails_helper"

describe "session status - timeout" do
  let(:browser) { Capybara.current_session.driver.browser }
  let(:user) { create :user }

  it "automatically signs the user out" do
    login_as user
    visit session_status_specs_timeout_path
    wait_for_selector ".component-session-status-specs-timeout"
    wait_for_selector ".status-text", text: "isUserSignedIn: Yes"
    logout(:user)
    wait_for_selector ".status-text", text: "isUserSignedIn: No"
  end
end
