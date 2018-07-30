require "rails_helper"

describe "model belongs to relationships" do
  let!(:user) { create :user }

  it "finds the parent model", :js do
    login_as user

    visit devise_specs_current_user_spec_path

    expect(current_path).to eq devise_specs_current_user_spec_path

    WaitUtil.wait_for_condition("user to be found") do
      find("[data-controller='devise--current-user']", visible: false)["data-current-user-completed"] == "true"
    end

    project_data = JSON.parse(find("[data-controller='devise--current-user']", visible: false)["data-current-user-result"])

    expect(project_data).to eq("id" => user.id, "email" => user.email)
  end
end
