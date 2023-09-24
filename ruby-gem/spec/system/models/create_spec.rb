require "rails_helper"

describe "model create" do
  let(:account) { create :account }
  let(:user) { create :user }

  it "creates a model" do
    login_as user

    visit models_create_path(account_id: account.id)

    wait_for_path models_create_path

    wait_for_browser { wait_for_and_find("[data-controller='models--create']", visible: false)["data-create-completed"] == "true" }
    wait_for_browser { Project.count > 0 }

    created_project = Project.last!
    element = wait_for_and_find("[data-controller='models--create']", visible: false)

    expect(created_project.name).to eq "test-create-project"
    expect(element["data-project-name"]).to eq "test-create-project"
  end

  it "prevents saving when no access (not signed in)" do
    visit models_create_path

    visit_action = proc do
      wait_for_path models_create_path
      wait_for_browser { find("[data-controller='models--create']", visible: false)["data-create-completed"] == "true" }
    end

    expect { visit_action.call }.to raise_error(RuntimeError, "UnhandledRejection: No access to create Project")
    sleep 1 # Some stuff in JS may be going on - give it some time to wrap up
    browser_logs # Clear up the logs manually
  end
end
