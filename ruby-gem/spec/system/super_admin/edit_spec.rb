require "rails_helper"

describe "super admin - edit" do
  let(:project) { create :project }
  let(:task) { create :task }
  let(:user_admin) { create :user, admin: true }

  it "navigates to the edit-model-page, enters the form, submits and edits an existing record" do
    project
    task

    login_as user_admin
    super_admin_test_edit(
      task,
      inputs: {
        name: "Edit task name",
        project_id: project.id,
        user_id: user_admin.id
      }
    )
  end
end
