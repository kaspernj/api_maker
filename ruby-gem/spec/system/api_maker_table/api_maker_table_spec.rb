require "rails_helper"

describe "bootstrap - live table" do
  let(:task1) { create :task, created_at: "1985-06-17 10:30", name: "Task 1" }
  let(:task2) { create :task, created_at: "1989-03-18 14:00", name: "Task 2" }
  let(:user_admin) { create :user, admin: true }

  let(:filter_card_selector) { ".live-table--filter-card" }
  let(:filter_form_selector) { ".live-table--filter-form" }
  let(:filter_submit_button_selector) { ".live-table--submit-filter-button" }
  let(:no_tasks_available_content) { ".no-tasks-available-content" }
  let(:no_tasks_found_content) { ".no-tasks-found-content" }

  let(:created_at_identifier) { "attribute-createdAt--sort-key-createdAt" }
  let(:finished_identifier) { "attribute-finsihed--sort-key-finsihed" }

  it "renders a table with rows" do
    task1
    task2

    login_as user_admin
    visit bootstrap_live_table_path

    # It shows the expected rows and columns
    wait_for_selector model_row_selector(task1)
    wait_for_selector "#{model_column_selector(task1, created_at_identifier)} .live-table-column-value", exact_text: "17/06-85 10:30"

    wait_for_selector model_row_selector(task2)
    wait_for_selector model_column_selector(task2, created_at_identifier), exact_text: "18/03-89 14:00"

    # It doesnt show columns with defaultVisible: false
    wait_for_no_selector model_column_selector(task1, finsihed_identifier)
    wait_for_no_selector model_column_selector(task2, finsihed_identifier)

    # It doesn't show the no-tasks-found-content when tasks are found
    wait_for_no_selector no_tasks_found_content

    # It creates table settings in the backend
    created_table_setting = ApiMakerTable::TableSetting.last!

    expect(created_table_setting).to have_attributes(
      identifier: "tasks-default", # It generates an identifier itself
      user: user_admin # It belongs to the current user
    )

    created_at_column = created_table_setting.columns.find_by!(identifier: created_at_identifier)
    expect(created_at_column).to have_attributes(
      attribute_name: "createdAt",
      visible: nil
    )

    finsihed_column = created_table_setting.columns.find_by!(identifier: finsihed_identifier)
    expect(finsihed_column).to have_attributes(
      attribute_name: "finsihed",
      visible: nil
    )
  end

  describe "filtering" do
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

  it "destroys a row" do
    task1
    task2

    login_as user_admin
    visit bootstrap_live_table_path
    wait_for_selector model_row_selector(task1)
    wait_for_selector model_row_selector(task2)
    wait_for_action_cable_to_connect

    destroy_action = proc do
      wait_for_and_find("#{model_row_selector(task2)} .destroy-button").click
      confirm_accept
      wait_for_no_selector model_row_selector(task2)
    end

    expect { destroy_action.call }.to change(Task, :count).by(-1)
    expect { task2.reload }.to raise_error(ActiveRecord::RecordNotFound)
    wait_for_selector model_row_selector(task1)
  end

  describe "no records found or available" do
    it "shows noRecordsAvailableContent if no rows are available" do
      login_as user_admin
      visit bootstrap_live_table_path(no_records_available_content: true, no_records_found_content: true)
      wait_for_selector no_tasks_available_content, text: "No tasks were available!"
      wait_for_no_selector no_tasks_found_content
    end

    it "shows noRecordsFoundContent if rows are available but none found because of filters" do
      task1
      task2

      login_as user_admin
      visit bootstrap_live_table_path(no_records_available_content: true, no_records_found_content: true, tasks_q: {id_null: true})
      wait_for_selector no_tasks_found_content, text: "No tasks were found!"
      wait_for_no_selector no_tasks_available_content
    end
  end

  it "sorts by default given through params when switching pages" do
    tasks = []
    characters = %w[0 1 2 3 4 5 6 7 8 9]

    9.downto(0) do |number1|
      9.downto(0) do |number2|
        tasks << create(:task, name: "#{characters[number1]}#{characters[number2]}-task")
      end
    end

    login_as user_admin
    visit bootstrap_live_table_path

    tasks.slice(70, 30).reverse_each do |task|
      wait_for_selector model_row_selector(task)
    end

    wait_for_and_find(".page-link", text: 2).click

    tasks.slice(40, 30).reverse_each do |task|
      wait_for_selector model_row_selector(task)
    end

    wait_for_and_find(".page-link", text: 3).click

    tasks.slice(10, 30).reverse_each do |task|
      wait_for_selector model_row_selector(task)
    end
  end
end
