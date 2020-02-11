require "rails_helper"

describe "bootstrap - string input" do
  let(:task) { create :task, created_at: "1985-06-17 10:30:00", user: user }
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
    wait_for_selector ".content-container"

    input = find("#date_object")

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
end
