require "rails_helper"

describe "super admin - show" do
  let(:task) { create :task }
  let(:user_admin) { create :user, admin: true }

  it "renders the page" do
    login_as user_admin
    visit super_admin_path(model_class: "Task", model_id: taks.id)
    wait_for_attribute_row attribute: "id", exact_text: task.id
  end
end
