require "rails_helper"

describe ApiMaker::CollectionSerializer do
  let!(:account) { create :account, customer: customer, id: 1 }
  let!(:customer) { create :customer, id: 5, name: "Test customer" }
  let!(:project) { create :project, account: account, id: 2, name: "Test project" }
  let!(:project_detail) { create :project_detail, project: project, id: 6, details: "Test project details" }
  let!(:task) { create :task, id: 3, name: "Test task", project: project, user: user }
  let!(:user) { create :user, id: 4 }

  let(:task_with_same_project) { create :task, project: project }

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

  it "includes an empty relationship if it has been included but doesnt exist for has one" do
    project_detail.destroy!

    collection = Project.where(id: project.id)
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, include_param: ["project_detail"]).to_json)

    expect(result.dig("data", 0, "relationships")).to have_key "project_detail"
    expect(result.dig("data", 0, "relationships", "project_detail")).to eq nil
  end

  it "includes an empty array if it has been included but doesnt exist for has many" do
    task.destroy!

    collection = Project.where(id: project.id)
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, include_param: ["tasks"]).to_json)

    expect(result.dig("data", 0, "relationships")).to have_key "tasks"
    expect(result.dig("data", 0, "relationships", "tasks")).to eq("data" => [])
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

  it "preloads a relationship through another relationship on the same model" do
    collection = Task.where(id: task.id)
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, include_param: ["customer"]).to_json)

    customer_include = result.fetch("included").find { |record| record.fetch("type") == "customers" && record.fetch("id") == 5 }

    expect(result.dig("data", 0, "relationships", "customer", "data", "id")).to eq 5
    expect(customer_include.dig("attributes", "name")).to eq "Test customer"
  end

  it "only includes the same relationship once for belongs to relationships" do
    collection = Task.where(id: [task.id, task_with_same_project.id])
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, include_param: ["project"]).to_json)

    expect(result.fetch("data").length).to eq 2

    count = 0
    result.fetch("included").each do |data|
      count += 1 if data.fetch("type") == "projects" && data.fetch("id") == project.id
    end

    expect(count).to eq 1
  end

  it "only includes the same relationship once for has one through" do
    collection = Task.where(id: [task.id, task_with_same_project.id])
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, include_param: ["account", "project.account"]).to_json)

    expect(result.fetch("data").length).to eq 2

    count = 0
    result.fetch("included").each do |data|
      count += 1 if data.fetch("type") == "accounts" && data.fetch("id") == account.id
    end

    expect(count).to eq 1
  end
end
