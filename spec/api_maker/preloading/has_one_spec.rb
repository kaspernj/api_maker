require "rails_helper"

describe "preloading - has one" do
  let(:project) { create :project }
  let(:project_detail) { create :project_detail, project: project }

  it "sets the relationship to nil and doesnt crash when its preloaded but doesnt exist" do
    collection = Project.where(id: [project.id])
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, include_param: ["project_detail.accounts"]).to_json)

    expect(result.dig("data", "projects", project.id.to_s, "relationships", "project_detail")).to eq nil
  end
end
