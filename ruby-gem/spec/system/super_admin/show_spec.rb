require "rails_helper"

describe "super admin - show" do
  let(:task) { create :task }
  let(:user_admin) { create :user, admin: true }

  it "renders the page" do
    login_as user_admin
    visit super_admin_path(model: "Task", model_id: task.id)
    wait_for_selector ".super-admin--show-page"
  end
end
