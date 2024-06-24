require "rails_helper"

describe "preloading - has many through has many through has many" do
  let!(:account) { create :account, customer:, id: 1 }
  let!(:customer) { create :customer, id: 5, name: "Test customer" }
  let!(:project) { create :project, account:, id: 2, name: "Test project" }
  let!(:project_detail) { create :project_detail, project:, id: 6, details: "Test project details" }
  let!(:task) { create :task, id: 3, name: "Test task", project:, user: }
  let!(:user) { create :user, id: 4 }

  let(:task_with_same_project) { create :task, project: }

  it "preloads has many through relationships that ends in a has one through" do
    collection = Customer.where(id: customer.id)
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection:, query_params: {preload: ["project_details"]}).to_json)

    expect(result.dig!("data", "customers")).to eq [5]
    expect(result.dig!("preloaded", "customers", "5", "r", "project_details")).to eq [project_detail.id]
    expect(result.dig!("preloaded", "project_details", "6", "a", "id")).to eq project_detail.id
    expect(result.dig!("preloaded").length).to eq 2
  end
end
