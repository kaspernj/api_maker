require "rails_helper"

describe ApiMaker::CollectionSerializer do
  let!(:account) { create :account, customer: customer, id: 1 }
  let!(:customer) { create :customer, id: 5, name: "Test customer" }
  let!(:project) { create :project, account: account, id: 2, name: "Test project" }
  let!(:project_detail) { create :project_detail, project: project, id: 6, details: "Test project details" }
  let!(:task) { create :task, id: 3, name: "Test task", project: project, user: user }
  let!(:user) { create :user, id: 4 }

  let(:task_with_same_project) { create :task, project: project }

  it "preloads has many through relationships that ends in a has one through" do
    collection = Customer.where(id: customer.id)
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, include_param: ["project_details"]).to_json)

    expect(result.dig("data", 0, "relationships", "project_details").length).to eq 1
    expect(result.dig("data", 0, "relationships", "project_details", "data", 0, "id")).to eq project_detail.id
    expect(result.dig("included", 0, "id")).to eq project_detail.id
    expect(result.dig("included").length).to eq 1
  end
end
