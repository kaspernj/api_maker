require "rails_helper"

describe "model create" do
  it "creates a model", :js do
    visit models_create_path

    expect(current_path).to eq models_create_path

    WaitUtil.wait_for_condition("project to be created") { find("[data-controller='models--create']", visible: false)["data-create-completed"] == "true" }
    WaitUtil.wait_for_condition("project to appear in database") { Project.count > 0 }

    created_project = Project.last
    element = find("[data-controller='models--create']", visible: false)

    expect(created_project.name).to eq "test-create-project"
    expect(element["data-project-name"]).to eq "test-create-project"
  end
end
