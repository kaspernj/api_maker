require "rails_helper"

describe "model destroy" do
  it "updates the model", :js do
    visit models_create_path

    expect(current_path).to eq models_create_path

    expect do
      WaitUtil.wait_for_condition("project to be created") { find("[data-controller='models--create']", visible: false)["data-create-completed"] == "true" }
      sleep 2
      # binding.pry
    end.to change(Project, :count).by(1)

    created_project = Project.last

    expect(created_project.name).to eq "test-create-project"
  end
end
