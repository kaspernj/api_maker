require "rails_helper"

describe "super admin - new" do
  let(:project) { create :project }
  let(:user_admin) { create :user, admin: true }

  it "navigates to the new-model-page, enters the form, submits and created a new record" do
    project

    login_as user_admin
    super_admin_test_new(
      Task,
      inputs: {
        name: "New task name",
        project_id: project.id,
        user_id: user_admin.id
      }
    )
  end
end
