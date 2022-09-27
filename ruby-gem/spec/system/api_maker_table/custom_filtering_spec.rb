require "rails_helper"

describe "bootstrap - live table - custom filtering" do
  let(:task1) { create :task, created_at: "1985-06-17 10:30", name: "Task 1" }
  let(:task2) { create :task, created_at: "1989-03-18 14:00", name: "Task 2" }
  let(:user_admin) { create :user, admin: true }

  let(:filter_card_selector) { ".live-table--filter-card" }
  let(:filter_form_selector) { ".live-table--filter-form" }
  let(:filter_submit_button_selector) { ".live-table--submit-filter-button" }

  it "uses the filter to filter results" do
    task1
    task2

    login_as user_admin
    visit bootstrap_live_table_path
    wait_for_selector model_row_selector(task1)
    wait_for_selector model_row_selector(task2)
    wait_for_and_find("input[name='name_cont']").set("Task 2")
    wait_for_no_selector model_row_selector(task1)
    wait_for_selector model_row_selector(task2)

    wait_for_selector filter_card_selector
    wait_for_selector filter_form_selector
    wait_for_selector filter_submit_button_selector
  end

  it "hides the filter card if given in props" do
    login_as user_admin
    visit bootstrap_live_table_path(live_table_props: JSON.generate(filterCard: false))
    wait_for_no_selector filter_card_selector
    wait_for_selector filter_form_selector
    wait_for_selector filter_submit_button_selector
  end

  it "hides the filter content if given in props" do
    login_as user_admin
    visit bootstrap_live_table_path(live_table_props: JSON.generate(filterContent: nil))
    wait_for_no_selector filter_card_selector
    wait_for_no_selector filter_form_selector
    wait_for_no_selector filter_submit_button_selector
  end

  it "hides the filter submit button if given in props" do
    login_as user_admin
    visit bootstrap_live_table_path(live_table_props: JSON.generate(filterSubmitButton: false))
    wait_for_selector filter_card_selector
    wait_for_selector filter_form_selector
    wait_for_no_selector filter_submit_button_selector
  end

  it "uses a custom label for the filter button is given" do
    login_as user_admin
    visit bootstrap_live_table_path(live_table_props: JSON.generate(filterSubmitLabel: "Test custom filter submit label"))
    wait_for_selector filter_card_selector
    wait_for_selector filter_form_selector
    wait_for_selector "#{filter_submit_button_selector}[value='Test custom filter submit label']"
  end
end
