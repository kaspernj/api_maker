require "rails_helper"

describe "models destroy event", :js do
  let!(:task1) { create :task, user: user }
  let!(:task2) { create :task, user: user }
  let!(:user) { create :user }

  it "reacts on destroy events" do
    login_as user

    visit models_destroy_event_path

    wait_for_selector ".task-row[data-task-id='#{task1.id}']"
    wait_for_selector ".task-row[data-task-id='#{task2.id}']"

    task1.destroy!

    wait_for_chrome { !page.has_selector?(".task-row[data-task-id='#{task1.id}']") }

    expect(page).to have_selector ".task-row[data-task-id='#{task2.id}']"
  end
end
