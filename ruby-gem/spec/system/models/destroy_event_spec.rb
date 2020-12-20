require "rails_helper"

describe "models destroy event" do
  let!(:task1) { create :task, user: user }
  let!(:task2) { create :task, user: user }
  let!(:user) { create :user }

  it "reacts on destroy events" do
    login_as user
    visit models_destroy_event_path
    wait_for_selector ".task-row[data-task-id='#{task1.id}']"
    wait_for_selector ".task-row[data-task-id='#{task2.id}']"

    # Give some time for ActionCable to connect
    sleep 1

    task1.destroy!

    wait_for_no_selector ".task-row[data-task-id='#{task1.id}']"
    wait_for_selector ".task-row[data-task-id='#{task2.id}']"
  end

  it "reuses the connection" do
    # Make sure we only create the connection once
    expect_any_instance_of(ApiMaker::SubscriptionsChannel).to receive(:subscribed).once.and_call_original

    login_as user
    visit models_destroy_event_path
    wait_for_selector ".task-row[data-task-id='#{task1.id}']"
    wait_for_selector ".task-row[data-task-id='#{task2.id}']"

    # Give some time for ActionCable to connect
    sleep 1

    wait_for_and_find(".show-destroyed-counter-button").click
    wait_for_selector ".destroyed-counter", text: 0

    sleep 0.5

    task1.destroy!

    wait_for_selector ".task-row[data-task-id='#{task2.id}']"
    wait_for_no_selector ".task-row[data-task-id='#{task1.id}']"

    wait_for_selector ".destroyed-counter", text: 1
  end
end
