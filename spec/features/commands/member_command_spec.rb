require "rails_helper"

describe "member command" do
  let(:task) { create :task, user: user }
  let(:user) { create :user }

  it "calls the correct command and responds", :js do
    login_as user

    visit commands_member_command_path(task_id: task.id)

    expect(current_path).to eq commands_member_command_path

    wait_for_chrome { find("[data-controller='commands--member']", visible: false)["data-test-member-response"].present? }

    response = JSON.parse(find("[data-controller='commands--member']", visible: false)["data-test-member-response"])

    expect(response.fetch("test_member_command_called")).to eq true
  end
end
