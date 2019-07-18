require "rails_helper"

describe "model update" do
  let!(:project) { create :project, name: "test-project" }

  it "updates the model" do
    visit models_update_path(project_id: project.id)

    expect(current_path).to eq models_update_path

    wait_for_chrome { find("[data-controller='models--update']", visible: false)["data-update-completed"] == "true" }
    wait_for_chrome { find("[data-controller='models--update']", visible: false)["data-result"] }

    expect(project.reload.name).to eq "test-update-project"

    result = JSON.parse(find("[data-controller='models--update']", visible: false)["data-result"])

    expect(result.fetch("initialChanged")).to eq false
    expect(result.fetch("initialChanges")).to eq({})
    expect(result.fetch("firstChanged")).to eq true
    expect(result.fetch("firstChanges")).to eq("name" => "test-update-project")
    expect(result.fetch("secondChanged")).to eq false
    expect(result.fetch("secondChanges")).to eq({})
  end
end
