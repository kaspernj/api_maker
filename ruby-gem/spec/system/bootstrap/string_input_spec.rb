require "rails_helper"

describe "bootstrap - string input" do
  let(:task) { create :task, created_at: "1985-06-17 10:30:00", user: user }
  let(:project) { create :project, price_per_hour: Money.new(100_00, "USD") }
  let(:user) { create :user, birthday_at: "1985-06-17" }

  it "renders a date field and sets the value correctly" do
    login_as user

    visit bootstrap_string_input_date_path
    wait_for_selector ".content-container"

    input = find("#user_birthday_at")

    expect(input[:value]).to eq "1985-06-17"
  end

  it "accepts Date object as defaultValue" do
    login_as user

    visit bootstrap_string_input_date_object_path
    input = wait_for_and_find("#date_object")

    expect(input[:value]).to eq "2020-01-01"
  end

  it "renders a datetime local field as sets the value correctly" do
    login_as user

    visit bootstrap_string_input_datetime_local_path(task_id: task.id)
    wait_for_selector ".content-container"

    input = find("#task_created_at")

    expect(input[:value]).to eq "1985-06-17T10:30:00"
  end

  it "only sets a name on a file input when a file is chosen" do
    login_as user

    visit bootstrap_string_input_file_path
    wait_for_selector ".content-container"

    expect(find("#user_image")[:name]).to eq ""
    attach_file "user_image", Rails.root.join("Gemfile")
    expect(find("#user_image")[:name]).to eq "user[image]"
  end

  it "renders several components for money" do
    login_as user

    visit bootstrap_string_input_money_path(project_id: project.id)
    wait_for_selector ".content-container"

    fill_in "project_price_per_hour", with: 500
    select "American Dollars", from: "project_price_per_hour_currency"

    find("input[type=submit]").click

    wait_for_browser do
      project.reload.price_per_hour.format == "$500.00"
    end
  end
end
