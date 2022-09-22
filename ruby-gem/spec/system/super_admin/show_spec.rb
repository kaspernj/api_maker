require "rails_helper"

describe "super admin - show" do
  let(:project) { create :project, name: "Test project" }
  let(:task) { create :task, project: project }
  let(:user_admin) { create :user, admin: true }

  it "renders the page" do
    login_as user_admin
    visit super_admin_path(model: "Task", model_id: task.id)
    wait_for_selector ".super-admin--show-page"
    wait_for_attribute_row attribute: "id", value: task.id

    # It shows 'belongs_to'-relationships as attributes
    wait_for_selector ".attribute-row-value", exact_text: "Test project"
  end
end
