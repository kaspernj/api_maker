require "rails_helper"

describe "bootstrap - string input" do
  let(:task) { create :task, created_at: "1985-06-17 10:30:00", user: user }
  let(:project) { create :project, price_per_hour: Money.new(100_00, "USD") }
  let(:user) { create :user, birthday_at: "1985-06-17" }

  let(:input_group_text_selector) { ".input-group-text" }

  it "renders a input field with pre-and append" do
    login_as user
    visit bootstrap_string_input_path

    # Input with both text and buttons
    wait_for_selector ".input-with-both #{input_group_text_selector}", text: "Hello world"
    wait_for_selector ".input-with-both .append-button"
    wait_for_selector ".input-with-both #{input_group_text_selector}", text: "Goodbye world"
    wait_for_selector ".input-with-both .prepend-button"

    # Input with text only
    wait_for_selector ".input-with-text #{input_group_text_selector}", text: "Hello world"
    wait_for_selector ".input-with-text #{input_group_text_selector}", text: "Goodbye world"

    # Input with buttons only
    wait_for_selector ".input-without-text .append-button"
    wait_for_selector ".input-without-text .prepend-button"
    wait_for_no_selector ".input-without-text #{input_group_text_selector}"
  end

  it "renders a date field and sets the value correctly" do
    login_as user
    visit bootstrap_string_input_date_path
    wait_for_selector ".content-container"
    wait_for_selector "#user_birthday_at[value='1985-06-17']"
  end

  it "accepts Date object as defaultValue" do
    login_as user
    visit bootstrap_string_input_date_object_path
    wait_for_selector "#date_object[value='2020-01-01']"
  end

  it "renders a datetime local field as sets the value correctly" do
    login_as user
    visit bootstrap_string_input_datetime_local_path(task_id: task.id)
    wait_for_selector ".content-container"
    wait_for_selector "#task_created_at[value='1985-06-17T10:30:00']"
  end

  it "only sets a name on a file input when a file is chosen" do
    login_as user
    visit bootstrap_string_input_file_path
    wait_for_selector ".content-container"

    expect(wait_for_and_find("#user_image")[:name]).to eq ""
    attach_file "user_image", Rails.root.join("Gemfile")
    wait_for_selector "#user_image[name='user[image]']"
  end

  it "renders several components for money" do
    login_as user
    visit bootstrap_string_input_money_path(project_id: project.id)
    wait_for_selector ".content-container"
    wait_for_selector "label[for='project_price_per_hour']"

    # It pre-fills the input
    wait_for_selector "#project_price_per_hour[value='100.00']", visible: false
    wait_for_expect { expect(wait_for_and_find("#project_price_per_hour_currency").value).to eq "USD" }

    # It fills in new values
    fill_in "project_price_per_hour", with: 500
    select "American Dollars", from: "project_price_per_hour_currency"

    wait_for_and_find("input[type=submit]").click

    wait_for_expect do
      expect(project.reload.price_per_hour.format).to eq "$500.00"
    end
  end
end
