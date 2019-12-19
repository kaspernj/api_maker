require "rails_helper"

describe "models - validation errors" do
  let!(:account1) { create :account, name: "Account 1" }
  let!(:account2) { create :account, name: "Account 2" }
  let!(:account3) { create :account, name: "Account 3" }

  let!(:project1) { create :project, account: account1, name: "Project 1" }
  let!(:project2) { create :project, account: account2, name: "Project 2" }
  let!(:project3) { create :project, account: account3, name: "Project 3" }

  let!(:task1) { create :task, name: "Task 1", project: project1, user: user }
  let!(:task2) { create :task, name: "Task 2", project: project2, user: user }
  let!(:task3) { create :task, name: "Task 3", project: project3, user: user }

  let!(:user) { create :user }

  it "renders validation errors when updating" do
    login_as user

    visit models_validation_errors_path(id: user.id)

    wait_for_selectors(
      ".component-models-validation-errors .content-container",
      "#task_name_#{task2.id}"
    )

    select "", from: "project_account_#{project1.id}"
    fill_in "task_name_#{task2.id}", with: ""
    fill_in "project_name_#{project3.id}", with: ""

    find("input[type=submit]").click
    wait_for_flash_message "Tasks project account must exist. Tasks name can't be blank. Tasks project name can't be blank"

    expect(wait_for_and_find(".project-account-1 .invalid-feedback").text).to eq "must exist"
    expect(wait_for_and_find(".task-name-2 .invalid-feedback").text).to eq "can't be blank"
    expect(wait_for_and_find(".project-name-3 .invalid-feedback").text).to eq "can't be blank"

    wait_for_no_selector ".task-name-1 .invalid-feedback"
    wait_for_no_selector ".task-name-3 .invalid-feedback"

    wait_for_no_selector ".project-account-2 .invalid-feedback"
    wait_for_no_selector ".project-account-3 .invalid-feedback"

    wait_for_no_selector ".project-name-1 .invalid-feedback"
    wait_for_no_selector ".project-name-2 .invalid-feedback"
  end
end
