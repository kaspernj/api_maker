require "rails_helper"

describe "models - validation errors" do
  let!(:project1) { create :project, name: "Project 1" }
  let!(:project2) { create :project, name: "Project 2" }
  let!(:project3) { create :project, name: "Project 3" }

  let!(:task1) { create :task, project: project1, user: user }
  let!(:task2) { create :task, project: project2, user: user }
  let!(:task3) { create :task, project: project3, user: user }

  let!(:user) { create :user }

  it "renders validation errors when updating" do
    login_as user

    visit models_validation_errors_path(id: user.id)

    wait_for_selectors(
      ".component-models-validation-errors .content-container",
      "#task_name_#{task2.id}"
    )

    fill_in "task_name_#{task2.id}", with: ""
    find("input[type=submit]").click
    wait_for_flash_message "Tasks name can't be blank"

    expect(wait_for_and_find(".task-name-2 .invalid-feedback").text).to eq "can't be blank"

    wait_for_no_selector ".task-name-1 .invalid-feedback"
    wait_for_no_selector ".task-name-3 .invalid-feedback"
  end
end
