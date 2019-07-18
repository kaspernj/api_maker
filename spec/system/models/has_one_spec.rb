require "rails_helper"

describe "model belongs to relationships" do
  let!(:project) { create :project }
  let!(:project_detail) { create :project_detail, project: project }

  it "finds the parent model" do
    visit models_has_one_path(project_id: project.id)

    expect(current_path).to eq models_has_one_path

    wait_for_chrome { find("[data-controller='models--has-one']", visible: false)["data-has-one-completed"] == "true" }

    project_detail_data = JSON.parse(find("[data-controller='models--has-one']", visible: false)["data-project-detail"])

    expect(project_detail_data).to eq("id" => project_detail.id, "details" => project_detail.details)
  end
end
