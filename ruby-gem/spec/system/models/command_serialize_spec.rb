require "rails_helper"

describe "models - command serialize" do
  let(:task) { create :task, user: }
  let(:user) { create :user }

  it "serializes and de-serializes automatically" do
    login_as user
    visit models_command_serialize_path(task_id: task.id)
    wait_for_selector ".component-models-command-serialize .content-container"

    response_data = JSON.parse(wait_for_and_find(".content-container").text)

    expect(response_data.dig!("modelData", "id")).to eq task.id
    expect(response_data.dig!("modelData", "user_id")).to eq user.id
    expect(response_data.fetch("newRecord")).to be false
  end
end
