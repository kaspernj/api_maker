require "rails_helper"

describe "bootstrap - string input" do
  let(:task) { create :task, created_at: "1985-06-17 10:30:00", user: user }
  let(:user) { create :user }

  it "renders a datetime local field as sets the value correctly" do
    login_as user

    visit bootstrap_string_input_datetime_local_path(task_id: task.id)

    wait_for_selector ".content-container"

    input = find("#task_created_at")

    expect(input[:value]).to eq "1985-06-17T10:30:00"
  end
end
