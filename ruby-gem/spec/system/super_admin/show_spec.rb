require "rails_helper"

describe "super admin - show" do
  let(:project) { create :project, name: "Test project" }
  let(:task) { create :task, project: }
  let(:user_admin) { create :user, admin: true }

  it "renders the page" do
    login_as user_admin
    super_admin_test_show_render(
      task,
      attributes: {
        id: task.id
      }
    )

    # It shows 'belongs_to'-relationships as attributes
    wait_for_selector ".attribute-row-value", exact_text: "Test project"
  end

  it "destroys the record" do
    login_as user_admin
    super_admin_test_show_destroy(task)
  end
end
