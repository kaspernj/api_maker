require "rails_helper"

describe "boootstrap - checkbox" do
  let(:task) { create :task, user: user }
  let(:user) { create :user }

  it "renders a boolean based checkbox by default" do
    login_as user

    visit bootstrap_checkbox_path(task_id: task.id)

    wait_for_selector ".content-container"
  end
end
