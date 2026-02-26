require "rails_helper"

describe "models destroy event" do
  let!(:task1) { create :task, user: }
  let!(:task2) { create :task, user: }
  let!(:user) { create :user }

  it "reacts on destroy events for subscribed models in an array" do
    login_as user
    visit models_destroy_event_path
    wait_for_selector ".task-row[data-task-id='#{task1.id}']"
    wait_for_selector ".task-row[data-task-id='#{task2.id}']"
    wait_for_action_cable_to_connect

    task1.destroy!

    wait_for_no_selector ".task-row[data-task-id='#{task1.id}']"
    wait_for_selector ".task-row[data-task-id='#{task2.id}']"
  end
end
