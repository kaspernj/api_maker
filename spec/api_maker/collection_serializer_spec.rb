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

    expect(result.dig("included", "users", "4", "relationships", "tasks")).to eq [3]
    expect(result.dig("included", "users", "4", "relationships").length).to eq 1

    account_include = result.fetch("included").fetch("accounts").fetch("1")
    project_include = result.fetch("included").fetch("projects").fetch("2")
    task_include = result.fetch("included").fetch("tasks").fetch("3")

    expect(project_include.dig("attributes", "name")).to eq "Test project"
    expect(project_include.dig("relationships")).to eq("account" => 1)

    expect(task_include.dig("relationships")).to eq(
      "account" => 1,
      "project" => 2
    )
    expect(account_include).to eq(
      "attributes" => {
        "id" => 1,
        "name" => "Account 1"
      },
      "relationships" => {}
    )
  end

  it "preloads has one relationships" do
    collection = Project.where(id: project.id)
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, include_param: ["project_detail"]).to_json)

    expect(result.dig("included", "projects", "2", "relationships", "project_detail")).to eq 6
    expect(result.dig("included", "project-details", "6", "attributes", "details")).to eq "Test project details"
  end

  it "includes an empty relationship if it has been included but doesnt exist for has one" do
    project_detail.destroy!

    collection = Project.where(id: project.id)
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, include_param: ["project_detail"]).to_json)

    expect(result.dig("included").fetch("projects").fetch("2").fetch("relationships").fetch("project_detail")).to eq nil
  end

  it "includes an empty array if it has been included but doesnt exist for has many" do
    task.destroy!

    collection = Project.where(id: project.id)
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, include_param: ["tasks"]).to_json)

    expect(result.dig("included", "projects", "2", "relationships", "tasks")).to eq []
  end

  it "preloads has one through relationships" do
    collection = User.where(id: user.id)
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, include_param: ["tasks.customer"]).to_json)

    expect(result.dig("included", "users", "4", "attributes", "id")).to eq 4
    expect(result.dig("included", "users", "4", "relationships", "tasks")).to eq [3]

    customer_include = result.fetch("included").fetch("customers").fetch("5")

    expect(customer_include).to be_present
    expect(customer_include.dig("attributes", "id")).to eq 5
    expect(customer_include.dig("attributes", "name")).to eq "Test customer"
  end

  it "preloads like on commoditrader listing company" do
    collection = User.where(id: user.id)
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, include_param: ["tasks.project_detail"]).to_json)

    expect(result.dig("data", "users")).to eq [user.id]
    expect(result.dig("included", "users", user.id.to_s, "relationships", "tasks")).to eq [3]

    task_include = result.fetch("included").fetch("tasks").fetch("3")
    project_detail_include = result.fetch("included").fetch("project-details").fetch("6")

    expect(task_include.dig("relationships", "project_detail")).to eq 6
    expect(project_detail_include.dig("attributes", "details")).to eq "Test project details"
  end

  it "preloads a relationship through another relationship on the same model" do
    collection = Task.where(id: task.id)
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, include_param: ["customer"]).to_json)

    customer_include = result.fetch("included").fetch("customers").fetch("5")

    expect(result.dig("data", "tasks")).to eq [3]
    expect(result.dig("included", "tasks", "3", "relationships", "customer")).to eq 5
    expect(customer_include.dig("attributes", "name")).to eq "Test customer"
  end

  it "only includes the same relationship once for belongs to relationships" do
    collection = Task.where(id: [task.id, task_with_same_project.id])
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, include_param: ["project"]).to_json)

    expect(result.fetch("data").fetch("tasks")).to eq [task.id, task_with_same_project.id]
    expect(result.fetch("included").fetch("projects").fetch(project.id.to_s).fetch("attributes").fetch("id")).to eq project.id
    expect(result.fetch("included").fetch("projects").length).to eq 1
  end

  it "only includes the same relationship once for has one through" do
    collection = Task.where(id: [task.id, task_with_same_project.id])
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, include_param: ["account", "project.account"]).to_json)

    expect(result.fetch("data").fetch("tasks").length).to eq 2
    expect(result.fetch("included").fetch("accounts").fetch(account.id.to_s).fetch("attributes").fetch("id")).to eq account.id
    expect(result.fetch("included").fetch("accounts").length).to eq 1
  end
end
