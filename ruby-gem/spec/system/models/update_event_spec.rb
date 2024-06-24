require "rails_helper"

describe "models - update event" do
  let(:finished_task) { create :task, finished: true, user: }
  let(:unfinished_task) { create :task, finished: false, user: }
  let(:user) { create :user }

  it "ignores updates from other models" do
    finished_task
    unfinished_task

    login_as user
    visit models_update_event_path
    wait_for_selector ".finished-task-container[data-connected='true']"

    unfinished_task.update!(name: "Some updated name")
    finished_task.update!(name: "Some updated name for the finished task")

    wait_for_selector ".finished-task-name", text: "Some updated name for the finished task"
  end
end
