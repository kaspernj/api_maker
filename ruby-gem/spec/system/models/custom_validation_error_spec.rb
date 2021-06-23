require "rails_helper"

describe "models - custom validation error" do
  let(:account) { create :account }
  let(:user) { create :user, admin: true }

  it "renders validation errors when updating" do
    account

    login_as user
    visit models_validation_error_path
    wait_for_selector ".routes-models-custom-validation-error .content-container"
    wait_for_and_find(".submit-button").click
    wait_for_selector ".error-for-project-name", text: "Yes"
    fill_in "project_name", with: "Project name"
    wait_for_and_find(".submit-button").click
    wait_for_selector ".error-for-project-name", text: "No"
  end
end
