require "rails_helper"

describe "super admin - new" do
  let(:project) { create :project }
  let(:user_admin) { create :user, admin: true }

  it "navigates to the new-model-page, enters the form, submits and created a new record" do
    project

    login_as user_admin
    visit super_admin_path(model: "Task")
    wait_for_and_find(".create-new-model-link").click
    wait_for_selector ".super-admin--edit-page"
    wait_for_and_find("#task_name").set("New task name")
    wait_for_and_find("#task_project_id").set(project.id)
    wait_for_and_find("#task_user_id").set(user_admin.id)
    wait_for_and_find("button").click
    wait_for_expect { expect(Task.count).to eq 1 }

    created_task = Task.last!

    expect(created_task).to have_attributes(
      name: "New task name",
      project_id: project.id
    )
  end
end
