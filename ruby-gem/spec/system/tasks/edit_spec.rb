require "rails_helper"

describe "tasks - edit" do
  let(:admin) { create :user, :admin }
  let(:task) { create :task, name: "Test task" }

  it "updates a given task" do
    login_as admin
    visit edit_task_path(task)
    wait_for_and_find("#task_name").set("Test update task")
    find("input[type=submit]").click
    wait_for_flash_message "The task was saved"

    expect(task.reload).to have_attributes(
      name: "Test update task"
    )
  end
end
