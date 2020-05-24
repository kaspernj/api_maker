require "rails_helper"

describe "boootstrap - checkbox" do
  let(:task) { create :task, user: user }
  let(:user) { create :user }

  it "renders a boolean based checkbox by default" do
    login_as user

    visit bootstrap_checkbox_boolean_path(task_id: task.id)

    routes = execute_script "return Routes"
    expect(routes.keys).to include "bootstrapCheckboxBooleanPath"

    wait_for_selector ".content-container"

    input = find("#task_finished")

    expect(find(".form-check-label").text).to eq "Finished"
    expect(input[:checked]).to eq nil
    expect(input[:id]).to eq "task_finished"
    expect(input[:name]).to eq "task[finished]"
  end

  it "checks and saves" do
    login_as user

    visit bootstrap_checkbox_boolean_path(task_id: task.id)

    wait_for_selector ".content-container"

    input = find("#task_finished")

    expect(input[:checked]).to eq nil

    check "Finished"

    find("input[type=submit]").click

    wait_for_browser { task.reload.finished? }
  end

  it "unchecks and saves" do
    task.update!(finished: true)

    login_as user

    visit bootstrap_checkbox_boolean_path(task_id: task.id)

    wait_for_selector ".content-container"

    input = find("#task_finished")

    expect(input[:checked]).to eq "true"

    uncheck "Finished"

    find("input[type=submit]").click

    wait_for_browser { !task.reload.finished? }
  end
end
