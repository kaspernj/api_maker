require "rails_helper"

describe "model update" do
  let!(:project) { create :project }

  it "updates the model", :js do
    visit models_update_path(project_id: project.id)

    expect(current_path).to eq models_update_path

    WaitUtil.wait_for_condition("project to be updated") { find("[data-controller='models--update']", visible: false)["data-update-completed"] == "true" }

    expect(project.reload.name).to eq "test-update-project"
  end
end
