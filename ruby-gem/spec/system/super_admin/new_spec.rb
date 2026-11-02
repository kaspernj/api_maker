require "rails_helper"

describe "super admin - new" do
  let(:project) { create :project }
  let(:user_admin) { create :user, admin: true }

  # The create flow ends in a redirect whose model_id query we poll for; under CI
  # load the whole example can hit the example-level Timeout before the redirect
  # lands. The repo's CI retry mechanism gives it fresh sessions on retry (same
  # pattern as action_cable_cleanup_spec / per_page_spec).
  it "navigates to the new-model-page, enters the form, submits and created a new record", :retry do
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
