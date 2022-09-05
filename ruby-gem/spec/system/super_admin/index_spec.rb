require "rails_helper"

describe "super admin - index" do
  let(:task) { create :task }
  let(:user_admin) { create :user, admin: true }

  it "renders the page" do
    login_as user_admin
    visit super_admin_path
    wait_for_selector model_row_selector(task)
  end
end
