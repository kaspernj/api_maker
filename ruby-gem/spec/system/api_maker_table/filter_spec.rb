require "rails_helper"

describe "bootstrap - live table - filter" do
  let(:account1) { create :account, customer: customer1, name: "Account 1" }
  let(:customer1) { create :customer, name: "Customer 1" }
  let(:task1) { create :task, created_at: "1985-06-17 10:30", name: "Task 1", project: project1 }
  let(:project1) { create :project, account: account1, name: "Project 1" }

  let(:account2) { create :account, customer: customer2, name: "Account 2" }
  let(:customer2) { create :customer, name: "Customer 2" }
  let(:task2) { create :task, created_at: "1989-03-18 14:00", name: "Task 2", project: project2 }
  let(:project2) { create :project, account: account2, name: "Project 2" }
  let(:user_admin) { create :user, admin: true }

  let(:filter_card_selector) { ".live-table--filter-card" }
  let(:filter_form_selector) { ".live-table--filter-form" }
  let(:filter_submit_button_selector) { ".live-table--submit-filter-button" }
  let(:no_tasks_available_content) { ".no-tasks-available-content" }
  let(:no_tasks_found_content) { ".no-tasks-found-content" }

  let(:created_at_identifier) { "attribute-createdAt--sort-key-createdAt" }
  let(:finished_identifier) { "attribute-finished--sort-key-finished" }

  it "filters through directly on the model" do
    task1
    task2

    login_as user_admin
    visit bootstrap_live_table_path
    wait_for_selector model_row_selector(task1)
    wait_for_selector model_row_selector(task2)
    wait_for_and_find("[data-class='filter-button']").click
    wait_for_and_find(".add-new-filter-button").click
    wait_for_and_find("[data-class='attribute-element'][data-model-class='Task'][data-attribute-name='name']").click
    wait_for_and_find(".predicate-select").select("eq")
    wait_for_and_find(".value-input").set("Task 2")
    wait_for_and_find(".apply-filter-button").click
    wait_for_no_selector model_row_selector(task1)
    wait_for_selector model_row_selector(task2)

    # It removes a filter
    wait_for_and_find("[data-class='remove-filter-button']").click
    wait_for_selector model_row_selector(task1)
    wait_for_selector model_row_selector(task2)
  end

  it "filters through a relationship" do
    task1
    task2

    login_as user_admin
    visit bootstrap_live_table_path
    wait_for_selector model_row_selector(task1)
    wait_for_selector model_row_selector(task2)
    wait_for_and_find("[data-class='filter-button']").click
    wait_for_and_find(".add-new-filter-button").click
    wait_for_and_find("[data-class='reflection-element'][data-model-class='Task'][data-reflection-name='project']").click
    wait_for_and_find("[data-class='attribute-element'][data-model-class='Project'][data-attribute-name='name']").click
    wait_for_and_find(".predicate-select").select("eq")
    wait_for_and_find(".value-input").set("Project 2")
    wait_for_and_find(".apply-filter-button").click
    wait_for_no_selector model_row_selector(task1)
    wait_for_selector model_row_selector(task2)
  end

  it "filters through a relationship with a name that has multiple parts" do
    task1
    task2

    login_as user_admin
    visit bootstrap_live_table_path
    wait_for_selector model_row_selector(task1)
    wait_for_selector model_row_selector(task2)
    wait_for_and_find("[data-class='filter-button']").click
    wait_for_and_find(".add-new-filter-button").click
    wait_for_and_find("[data-class='reflection-element'][data-model-class='Task'][data-reflection-name='accountCustomer']").click
    wait_for_and_find("[data-class='attribute-element'][data-model-class='Customer'][data-attribute-name='name']").click
    wait_for_and_find(".predicate-select").select("eq")
    wait_for_and_find(".value-input").set("Customer 2")
    wait_for_and_find(".apply-filter-button").click
    wait_for_no_selector model_row_selector(task1)
    wait_for_selector model_row_selector(task2)
  end
end
