require "rails_helper"

describe "super admin - index" do
  let(:project) { create :project }
  let(:task) { create :task }
  let(:user_admin) { create :user, admin: true }

  it "renders the page, then switches to the index page of another model" do
    project

    login_as user_admin
    super_admin_test_index_render(task)

    # It goes to the projects page and renders the project rows
    wait_for_and_find(".components--admin--layout--menu--menu-item[data-identifier='Project']").click
    wait_for_expect { expect(current_url).to end_with "/super_admin?model=Project" }
    wait_for_selector model_row_selector(project)
  end

  it "deletes a record" do
    login_as user_admin
    super_admin_test_index_destroy(task)
  end
end
