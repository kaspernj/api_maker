require "rails_helper"

describe "utils - checkbox" do
  let(:task) { create :task, user: }
  let(:user) { create :user }

  it "toggles when uncontrolled" do
    login_as user
    visit utils_checkbox_path

    wait_for_selector "[data-testid='utils-checkbox-uncontrolled'][data-checked='false']"
    wait_for_and_find("[data-testid='utils-checkbox-uncontrolled']").click
    wait_for_selector "[data-testid='utils-checkbox-uncontrolled'][data-checked='true']"
  end

  it "sets the form value from the model default before interaction" do
    task.update!(finished: true)

    login_as user
    visit utils_checkbox_path(task_id: task.id)

    wait_for_selector "[data-testid='utils-checkbox-form'][data-checked='true']"
    wait_for_and_find("[data-testid='utils-checkbox-submit']").click
    wait_for_selector "[data-testid='utils-checkbox-saved-form-value']", text: "true"
    expect(task.reload).to be_finished
  end

  it "sets false as the form value from the model default before interaction" do
    login_as user
    visit utils_checkbox_path(task_id: task.id)

    wait_for_selector "[data-testid='utils-checkbox-form'][data-checked='false']"
    wait_for_and_find("[data-testid='utils-checkbox-submit']").click
    wait_for_selector "[data-testid='utils-checkbox-saved-form-value']", text: "false"
    expect(task.reload).not_to be_finished
  end

  it "updates the form value when changed" do
    login_as user
    visit utils_checkbox_path(task_id: task.id)

    wait_for_selector "[data-testid='utils-checkbox-form'][data-checked='false']"
    wait_for_and_find("[data-testid='utils-checkbox-form']").click
    wait_for_selector "[data-testid='utils-checkbox-form'][data-checked='true']"
    wait_for_and_find("[data-testid='utils-checkbox-submit']").click
    wait_for_selector "[data-testid='utils-checkbox-saved-form-value']", text: "true"
    expect(task.reload).to be_finished
  end
end
