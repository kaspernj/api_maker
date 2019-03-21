require "rails_helper"

describe "session status - timeout", :js do
  let(:browser) { Capybara.current_session.driver.browser }
  let(:user) { create :user }

  it "automatically signs the user out" do
    login_as user

    visit session_status_specs_timeout_path

    wait_for_selector ".component-session-status-specs-timeout"

    expect(find(".status-text").text).to eq "isUserSignedIn: Yes"

    browser.manage.delete_all_cookies
    logout(:user)

    sleep 4

    binding.pry

    expect(find(".status-text").text).to eq "isUserSignedIn: No"
  end
end
