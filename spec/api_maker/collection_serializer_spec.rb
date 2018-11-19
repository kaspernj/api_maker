require "rails_helper"

describe ApiMaker::CollectionSerializer do
  let!(:account) { create :account, customer: customer, id: 1 }
  let!(:customer) { create :customer, id: 5, name: "Test customer" }
  let!(:project) { create :project, account: account, id: 2, name: "Test project" }
  let!(:project_detail) { create :project_detail, project: project, id: 6, details: "Test project details" }
  let!(:task) { create :task, id: 3, name: "Test task", project: project, user: user }
  let!(:user) { create :user, id: 4 }

  it "preloads relationships" do
    collection = User.where(id: user.id)
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, include_param: ["tasks.project.account", "tasks.account"]).to_json)

    expect(result.dig("data", 0, "relationships", "tasks", "data", 0, "id")).to eq 3

    project_include = result.fetch("included").find { |record| record.fetch("type") == "projects" && record.fetch("id") == 2 }

    expect(project_include.dig("attributes", "name")).to eq "Test project"
  end

  it "preloads has one relationships" do
    collection = Project.where(id: project.id)
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, include_param: ["project_detail"]).to_json)

    expect(result.dig("data", 0, "relationships", "project_detail", "data", "id")).to eq 6
    expect(result.dig("included", 0, "type")).to eq "project_details"
    expect(result.dig("included", 0, "id")).to eq 6
    expect(result.dig("included", 0, "attributes", "details")).to eq "Test project details"
  end

  it "preloads has one through relationships" do
    collection = User.where(id: user.id)
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, include_param: ["tasks.customer"]).to_json)

    expect(result.dig("data", 0, "type")).to eq "users"
    expect(result.dig("data", 0, "relationships", "tasks", "data", 0, "id")).to eq 3

    customer_include = result.fetch("included").find { |record| record.fetch("type") == "customers" && record.fetch("id") == 5 }

    expect(customer_include).to be_present
    expect(customer_include.dig("id")).to eq 5
    expect(customer_include.dig("attributes", "name")).to eq "Test customer"
  end

  it "preloads like on commoditreader listing company" do
    collection = User.where(id: user.id)
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, include_param: ["tasks.project_detail"]).to_json)

    expect(result.dig("data", 0, "relationships", "tasks", "data", 0, "id")).to eq 3

    task_include = result.fetch("included").find { |record| record.fetch("type") == "tasks" && record.fetch("id") == 3 }
    project_detail_include = result.fetch("included").find { |record| record.fetch("type") == "project_details" && record.fetch("id") == 6 }

    expect(task_include.dig("relationships", "project_detail", "data", "id")).to eq 6
    expect(project_detail_include.dig("attributes", "details")).to eq "Test project details"
  end
end
