require "rails_helper"

describe "boootstrap - checkbox" do
  let(:task) { create :task, user: }
  let(:user) { create :user }

  it "renders a boolean based checkbox by default" do
    login_as user
    visit bootstrap_checkbox_boolean_path(task_id: task.id)
    wait_for_selector ".content-container"
    wait_for_selector "#task_finished[name='task[finished]']:not(:checked)"
    wait_for_selector ".form-check-label", text: "Finished"
  end

  it "checks and saves" do
    login_as user
    visit bootstrap_checkbox_boolean_path(task_id: task.id)
    wait_for_selector ".content-container"
    wait_for_selector "label[for='task_finished']", exact_text: "Finished"
    wait_for_selector "#task_finished:not(:checked)"
    check "Finished"
    wait_for_selector "#task_finished:checked"
    wait_for_and_find("input[type=submit]").click
    wait_for_browser { task.reload.finished? }
  end

  it "unchecks and saves" do
    task.update!(finished: true)

    login_as user
    visit bootstrap_checkbox_boolean_path(task_id: task.id)
    wait_for_selector ".content-container"
    wait_for_selector "#task_finished:checked"
    uncheck "Finished"
    wait_for_and_find("input[type=submit]").click
    wait_for_browser { !task.reload.finished? }
  end
end
