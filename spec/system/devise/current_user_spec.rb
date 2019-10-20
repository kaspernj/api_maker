require "rails_helper"

describe "model belongs to relationships" do
  let!(:user) { create :user }

  it "finds the parent model" do
    login_as user, scope: :user

    visit devise_specs_current_user_spec_path

    expect(page).to have_current_path devise_specs_current_user_spec_path, ignore_query: true

    wait_for_chrome { find("[data-controller='devise--current-user']", visible: false)["data-current-user-completed"] == "true" }

    project_data = JSON.parse(find("[data-controller='devise--current-user']", visible: false)["data-current-user-result"])

    expect(project_data).to eq("id" => user.id, "email" => user.email)
  end
end
