require "rails_helper"

describe "super admin - content input names" do
  let(:user_admin) { create :user, admin: true }

  it "exposes the input name to content components" do
    login_as user_admin

    resource = ApiMaker::MemoryStorage.current.resource_for_model(Task)

    visit super_admin_path(model: resource.short_name)
    wait_for_and_find("[data-class='create-new-model-link']").click
    wait_for_selector "[data-testid='super-admin--edit-page']"

    wait_for_expect do
      expect(page).to have_css("[data-testid='super-admin-task-project-input-name']", text: "task[project_id]")
    end
  end
end
