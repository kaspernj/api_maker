require "rails_helper"

describe "bootstrap - live table - controls loading" do
  let(:user_admin) { create :user, admin: true }

  it "renders controls while loading" do
    login_as user_admin
    visit bootstrap_live_table_path(delay_query_ms: 2000, show_controls: true)
    wait_for_selector "[data-class='api-maker--table--loading']"
    wait_for_selector "[data-class='table-controls-test-button']"
    wait_for_selector "[data-class='api-maker--table--loading']"
  end
end
