require "rails_helper"

describe "super admin - actions cache key" do
  let(:user_admin) { create :user, admin: true }

  it "renders create new after abilities load" do
    resource = ApiMaker::MemoryStorage.current.resource_for_model(Task)

    login_as user_admin
    visit super_admin_path(model: resource.short_name)

    wait_for_selector("[data-class='create-new-model-link']")
    wait_for_and_find("[data-class='create-new-model-link']").click
    wait_for_selector("[data-testid='super-admin--edit-page']")
  end
end
