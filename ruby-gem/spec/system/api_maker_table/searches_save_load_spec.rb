require "rails_helper"

describe "table - filter" do
  let(:account1) { create :account, customer: customer1, name: "Account 1" }
  let(:customer1) { create :customer, name: "Customer 1" }
  let(:task1) { create :task, created_at: "1985-06-17 10:30", name: "Task 1", project: project1 }
  let(:project1) { create :project, account: account1, name: "Project 1" }

  let(:account2) { create :account, customer: customer2, name: "Account 2" }
  let(:customer2) { create :customer, name: "Customer 2" }
  let(:task2) { create :task, created_at: "1989-03-18 14:00", name: "Task 2", project: project2 }
  let(:project2) { create :project, account: account2, name: "Project 2" }
  let(:user_admin) { create :user, admin: true }

  let(:table_search) { create :table_search, user: user_admin }

  it "filters through directly on the model" do
    task1
    task2

    login_as user_admin
    visit bootstrap_live_table_path
    wait_for_selector model_row_selector(task1)
    wait_for_selector model_row_selector(task2)
    wait_for_and_find(".filter-button").click
    wait_for_and_find(".add-new-filter-button").click
    wait_for_and_find(".attribute-element[data-model-class='Task'][data-attribute-name='name']").click
    wait_for_and_find(".predicate-select").select("eq")
    wait_for_and_find(".value-input").set("Task 2")
    wait_for_and_find(".apply-filter-button").click
    wait_for_no_selector model_row_selector(task1)
    wait_for_selector model_row_selector(task2)

    # It saves the filter
    wait_for_and_find(".save-search-button").click
    wait_for_and_find("#table_search_name").set("Test search")
    wait_for_and_find(".save-search-submit-button").click
    wait_for_expect { ApiMakerTable::TableSearch.count == 1 }

    created_table_search = ApiMakerTable::TableSearch.last!

    expect(created_table_search).to have_attributes(
      user_id: user_admin.id,
      user_type: "User"
    )

    # It visits the initial page and shows all records
    visit bootstrap_live_table_path
    wait_for_selector model_row_selector(task1)
    wait_for_selector model_row_selector(task2)

    # It loads the newly saved filter
    wait_for_and_find(".filter-button").click
    wait_for_and_find(".load-search-button").click
    wait_for_and_find(".load-search-link", exact_text: "Test search").click

    wait_for_no_selector model_row_selector(task1)
    wait_for_selector model_row_selector(task2)
  end

  it "edits a search" do
    task1
    task2
    table_search
    search_row_selector = "[data-class='search-row'][data-search-id='#{table_search.id}']"

    login_as user_admin
    visit bootstrap_live_table_path
    wait_for_selector model_row_selector(task1)
    wait_for_selector model_row_selector(task2)
    wait_for_and_find(".filter-button").click
    wait_for_and_find(".load-search-button").click
    wait_for_selector search_row_selector
    wait_for_and_find("#{search_row_selector} [data-class='edit-search-button']").click
    wait_for_and_find("#table_search_name").set("Test search")
    wait_for_and_find(".save-search-submit-button").click
    wait_for_expect { expect(table_search.reload).to have_attributes(name: "Test search") }
  end

  it "deletes a search" do
    task1
    task2
    table_search
    search_row_selector = "[data-class='search-row'][data-search-id='#{table_search.id}']"

    login_as user_admin
    visit bootstrap_live_table_path
    wait_for_selector model_row_selector(task1)
    wait_for_selector model_row_selector(task2)
    wait_for_and_find(".filter-button").click
    wait_for_and_find(".load-search-button").click
    wait_for_selector search_row_selector

    accept_confirm do
      wait_for_and_find("#{search_row_selector} [data-class='delete-search-button']").click
    end

    wait_for_no_selector search_row_selector
    expect { table_search.reload }.to raise_error(ActiveRecord::RecordNotFound)
  end
end
