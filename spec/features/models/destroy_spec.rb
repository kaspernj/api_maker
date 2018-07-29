require "rails_helper"

describe "model destroy" do
  let!(:project) { create :project }

  it "destroys the model", :js do
    visit models_destroy_path(project_id: project.id)

    expect(current_path).to eq models_destroy_path

    WaitUtil.wait_for_condition("project to be destroyed") { find("[data-controller='models--destroy']", visible: false)["data-destroy-completed"] == "true" }

    expect { project.reload }.to raise_error(ActiveRecord::RecordNotFound)
  end
end
