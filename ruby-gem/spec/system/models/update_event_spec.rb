require "rails_helper"

describe "models - update event" do
  let(:finished_task1) { create :task, finished: true, name: "Finished 1", user: }
  let(:finished_task2) { create :task, finished: true, name: "Finished 2", user: }
  let(:unfinished_task) { create :task, finished: false, user: }
  let(:user) { create :user }

  it "reacts on updates for all subscribed models in an array" do
    finished_task1
    finished_task2
    unfinished_task

    login_as user
    visit models_update_event_path
    wait_for_selector ".finished-task-container[data-connected='true']"
    wait_for_selector ".finished-task-name[data-task-id='#{finished_task1.id}']", text: "Finished 1"
    wait_for_selector ".finished-task-name[data-task-id='#{finished_task2.id}']", text: "Finished 2"

    unfinished_task.update!(name: "Some updated name")
    finished_task1.update!(name: "Some updated name for finished task 1")
    finished_task2.update!(name: "Some updated name for finished task 2")

    wait_for_selector ".finished-task-name[data-task-id='#{finished_task1.id}']", text: "Some updated name for finished task 1"
    wait_for_selector ".finished-task-name[data-task-id='#{finished_task2.id}']", text: "Some updated name for finished task 2"
  end
end
