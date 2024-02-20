require "rails_helper"

describe "super admin - edit" do
  let(:task) { create :task }
  let(:user_admin) { create :user, admin: true }

  it "navigates to the edit-model-page, enters the form, submits and edits an existing record" do
    task

    login_as user_admin
    visit super_admin_path(model: "Task")
    wait_for_and_find(".edit-button").click
    wait_for_selector ".super-admin--edit-page"
    wait_for_and_find("#task_name").set("Edit task name")
    wait_for_and_find("#task_project_id").set(project.id)
    wait_for_and_find("#task_user_id").set(user_admin.id)
    wait_for_and_find("button").click
    wait_for_expect { expect(Task.count).to eq 1 }

    created_task = Task.last!

    expect(created_task).to have_attributes(
      name: "Edit task name",
      project_id: project.id
    )
  end
end
