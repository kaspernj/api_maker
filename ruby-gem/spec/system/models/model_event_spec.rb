require "rails_helper"

describe "models - model event" do
  let(:task1) { create :task, user: }
  let(:task2) { create :task, user: }
  let(:task3) { create :task, user: }
  let(:user) { create :user }

  it "reacts on events for all subscribed models in an array" do
    task1
    task2
    task3

    login_as user
    visit models_model_event_path
    wait_for_selector ".component-models-model-event[data-connected='true']"
    wait_for_selector ".task-event-count[data-task-id='#{task1.id}']", text: "0"
    wait_for_selector ".task-event-count[data-task-id='#{task2.id}']", text: "0"
    wait_for_no_selector ".task-event-count[data-task-id='#{task3.id}']"
    wait_for_action_cable_to_connect

    task1.api_maker_event("test_model_event", task_id: task1.id)
    task2.api_maker_event("test_model_event", task_id: task2.id)
    task3.api_maker_event("test_model_event", task_id: task3.id)

    wait_for_selector ".task-event-count[data-task-id='#{task1.id}']", text: "1"
    wait_for_selector ".task-event-count[data-task-id='#{task2.id}']", text: "1"
    wait_for_no_selector ".task-event-count[data-task-id='#{task3.id}']"
  end
end
