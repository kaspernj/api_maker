require "rails_helper"

describe "model update" do
  let!(:project) { create :project, name: "test-project" }
  let(:user) { create :user }

  it "updates the model" do
    login_as user

    visit models_update_path(project)

    wait_for_path models_update_path(project)

    wait_for_selector ".models-update[data-update-completed='true']", visible: false
    wait_for_selector ".models-update[data-change-attributes-result]", visible: false

    expect(project.reload.name).to eq "test-update-project"

    result = JSON.parse(wait_for_and_find(".models-update", visible: false)["data-change-attributes-result"])

    expect(result.fetch("initialChanged")).to be false
    expect(result.fetch("initialChanges")).to eq({})
    expect(result.fetch("firstChanged")).to be true
    expect(result.fetch("firstChanges")).to eq("name" => "test-update-project")
    expect(result.fetch("secondChanged")).to be false
    expect(result.fetch("secondChanges")).to eq({})
  end
end
