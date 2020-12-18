require "rails_helper"

describe "models created event" do
  let(:task) { create :task, name: "test create task", user: user }
  let(:task2) { create :task, user: user }
  let(:task_from_other_user) { create :task }
  let(:user) { create :user }

  it "receives the created event and adds a row to the table for tasks the user have access to" do
    login_as user

    visit models_created_event_path

    wait_for_selector ".tasks-table", visible: false

    sleep 0.5 # Wait for ActionCable to connect

    wait_for_no_selector ".task-row"

    task
    task_from_other_user

    wait_for_selector ".task-row[data-task-id='#{task.id}']"
    wait_for_selector ".task-row[data-task-id='#{task.id}'] .id-column", text: task.id.to_s
    wait_for_selector ".task-row[data-task-id='#{task.id}'] .name-column", text: "test create task"
    wait_for_no_selector ".task-row[data-task-id='#{task_from_other_user.id}']"
  end

  it "reuses the connection" do
    expect_any_instance_of(ApiMaker::SubscriptionsChannel).to receive(:subscribed).once.and_call_original

    login_as user

    visit models_created_event_path

    wait_for_selector ".tasks-table", visible: false

    sleep 0.5 # Wait for ActionCable to connect

    wait_for_no_selector ".task-row"

    task

    wait_for_selector ".task-row[data-task-id='#{task.id}']"

    wait_for_and_find(".show-events-counter-button").click
    wait_for_selector ".events-counter", text: 0

    sleep 0.5

    wait_for_selector ".task-row[data-task-id='#{task2.id}']"

    task2

    wait_for_selector ".events-counter", text: 1
  end
end
