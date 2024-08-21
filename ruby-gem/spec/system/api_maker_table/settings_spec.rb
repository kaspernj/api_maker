require "rails_helper"

describe "table - settings" do
  let(:account1) { create :account, customer: customer1, name: "Account 1" }
  let(:customer1) { create :customer, name: "Customer 1" }
  let(:task1) { create :task, created_at: "1985-06-17 10:30", name: "Task 1", project: project1 }
  let(:project1) { create :project, account: account1, name: "Project 1" }

  let(:account2) { create :account, customer: customer2, name: "Account 2" }
  let(:customer2) { create :customer, name: "Customer 2" }
  let(:task2) { create :task, created_at: "1989-03-18 14:00", name: "Task 2", project: project2 }
  let(:project2) { create :project, account: account2, name: "Project 2" }
  let(:user_admin) { create :user, admin: true }

  it "filters through directly on the model" do
    task1
    task2

    login_as user_admin
    visit bootstrap_live_table_path
    wait_for_selector model_row_selector(task1)
    wait_for_selector model_row_selector(task2)

    # It shows the ID-column
    wait_for_selector "[data-class='table--column'][data-identifier='attribute-id--sort-key-id']"

    # It triggers the settings modal
    wait_for_and_find(".settings-button").click
    wait_for_selector ".api-maker--table--settings"

    # It removes the ID column
    wait_for_and_find(".api-maker--table--setings--column-checkbox[data-identifier='attribute-id--sort-key-id']").click

    # It no longer shows the ID column
    wait_for_no_selector "[data-class='table--column'][data-identifier='attribute-id--sort-key-id']"
  end
end
