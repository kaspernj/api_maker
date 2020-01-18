require "rails_helper"

describe "preloading - has one" do
  let(:account) { create :account, customer: customer }
  let(:customer) { create :customer, id: 8 }
  let(:project) { create :project, account: account }
  let(:project_detail) { create :project_detail, project: project }
  let(:task) { create :task, id: 6, project: project }

  it "sets the relationship to nil and doesnt crash when its preloaded but doesnt exist" do
    collection = Project.where(id: [project.id])
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, include_param: ["project_detail.accounts"]).to_json)

    expect(result.dig("included", "projects", project.id.to_s, "r", "project_detail")).to eq nil
  end

  it "doesnt crash when trying to preload on an empty collection" do
    collection = Project.where(id: [project.id + 5])
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, include_param: ["project_detail.accounts"]).to_json)

    expect(result).to eq("data" => {}, "included" => {})
  end

  it "loads relationships through and with source" do
    collection = Task.where(id: task.id)
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, include_param: ["account_customer"]).to_json)

    expect(result.dig!("included", "tasks", "6", "r")).to eq("account_customer" => 8)
  end
end
