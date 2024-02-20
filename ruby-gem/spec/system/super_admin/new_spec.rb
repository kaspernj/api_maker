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
    wait_for_selector "#task_name"
  end
end
