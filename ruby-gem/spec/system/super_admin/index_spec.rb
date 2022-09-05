require "rails_helper"

describe "super admin - index" do
  let(:project) { create :project }
  let(:task) { create :task }
  let(:user_admin) { create :user, admin: true }

  it "renders the page, then switches to the index page of another model" do
    task

    login_as user_admin
    visit super_admin_path(model: "Task")
    wait_for_selector model_row_selector(task)

    # Wait for rendering to be complete
    sleep 1

    wait_for_and_find(".components--admin--layout--menu--menu-item[data-identifier='Project']").click
    wait_for_selector model_row_selector(project)
  end
end
