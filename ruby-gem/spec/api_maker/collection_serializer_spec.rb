require "rails_helper"

describe ApiMaker::CollectionSerializer do
  let!(:account) { create :account, customer:, id: 1, name: "Account 1" }
  let!(:customer) { create :customer, id: 5, name: "Test customer" }
  let!(:project) { create :project, account:, id: 2, name: "Test project" }
  let!(:project_detail) { create :project_detail, project:, id: 6, details: "Test project details" }
  let!(:task) { create :task, id: 3, name: "Test task", project:, user: }
  let!(:user) { create :user, id: 4 }
  let(:ability) { ApiMaker::Ability.new(api_maker_args: args) }
  let(:args) { {current_user: user} }

  let(:task_with_same_project) { create :task, project: }

  it "preloads relationships" do
    collection = User.where(id: user.id)
    collection_serializer = ApiMaker::CollectionSerializer.new(
      ability:,
      collection:,
      query_params: {
        preload: ["tasks.project.account", "tasks.account"]
      }
    )
    result = JSON.parse(collection_serializer.to_json)

    expect(result.dig("preloaded", "users", "4", "r", "tasks")).to eq [3]
    expect(result.dig("preloaded", "users", "4", "r").length).to eq 1

    account_preload = result.fetch("preloaded").fetch("accounts").fetch("1")
    project_preload = result.fetch("preloaded").fetch("projects").fetch("2")
    task_preload = result.fetch("preloaded").fetch("tasks").fetch("3")

    expect(project_preload.dig!("a", "name")).to eq "Test project"
    expect(project_preload.fetch("r")).to eq("account" => 1)

    expect(task_preload.fetch("r")).to eq(
      "account" => 1,
      "project" => 2
    )
    expect(account_preload).to eq(
      "a" => {
        "id" => 1,
        "name" => "Account 1"
      }
    )
  end

  it "preloads has one relationships" do
    collection = Project.where(id: project.id)
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection:, query_params: {preload: ["project_detail"]}).to_json)

    expect(result.dig("preloaded", "projects", "2", "r", "project_detail")).to eq 6
    expect(result.dig("preloaded", "project_details", "6", "a", "details")).to eq "Test project details"
  end

  it "includes an empty relationship if it has been preloaded but doesnt exist for has one" do
    project_detail.destroy!

    collection = Project.where(id: project.id)
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection:, query_params: {preload: ["project_detail"]}).to_json)

    expect(result.dig!("preloaded", "projects", "2", "r", "project_detail")).to be_nil
  end

  it "includes an empty array if it has been preloaded but doesnt exist for has many" do
    task.destroy!

    collection = Project.where(id: project.id)
    result = JSON.parse(ApiMaker::CollectionSerializer.new(ability:, collection:, query_params: {preload: ["tasks"]}).to_json)

    expect(result.dig("preloaded", "projects", "2", "r", "tasks")).to eq []
  end

  it "preloads has one through relationships" do
    collection = User.where(id: user.id)
    result = JSON.parse(ApiMaker::CollectionSerializer.new(ability:, collection:, query_params: {preload: ["tasks.customer"]}).to_json)

    expect(result.dig("preloaded", "users", "4", "a", "id")).to eq 4
    expect(result.dig("preloaded", "users", "4", "r", "tasks")).to eq [3]

    customer_preload = result.fetch("preloaded").fetch("customers").fetch("5")

    expect(customer_preload).to be_present
    expect(customer_preload.dig("a", "id")).to eq 5
    expect(customer_preload.dig("a", "name")).to eq "Test customer"
  end

  it "preloads like on commoditrader listing company" do
    collection = User.where(id: user.id)
    result = JSON.parse(ApiMaker::CollectionSerializer.new(ability:, collection:, query_params: {preload: ["tasks.project_detail"]}).to_json)

    expect(result.dig!("data", "users")).to eq [user.id]
    expect(result.dig!("preloaded", "users", user.id.to_s, "r", "tasks")).to eq [3]

    task_preload = result.dig!("preloaded", "tasks").fetch("3")
    project_detail_preload = result.dig!("preloaded", "project_details", "6")

    expect(task_preload.dig!("r", "project_detail")).to eq 6
    expect(project_detail_preload.dig!("a", "details")).to eq "Test project details"
  end

  it "preloads a relationship through another relationship on the same model" do
    collection = Task.where(id: task.id)
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection:, query_params: {preload: ["customer"]}).to_json)

    customer_preload = result.dig!("preloaded", "customers").fetch("5")

    expect(result.dig!("data", "tasks")).to eq [3]
    expect(result.dig!("preloaded", "tasks", "3", "r", "customer")).to eq 5
    expect(customer_preload.dig!("a", "name")).to eq "Test customer"
  end

  it "only includes the same relationship once for belongs to relationships" do
    collection = Task.where(id: [task.id, task_with_same_project.id])
    result = JSON.parse(ApiMaker::CollectionSerializer.new(api_maker_args: args, collection:, query_params: {preload: ["project"]}).to_json)

    expect(result.dig!("data", "tasks")).to eq [task.id, task_with_same_project.id]
    expect(result.dig!("preloaded", "projects", project.id.to_s, "a", "id")).to eq project.id
    expect(result.dig!("preloaded", "projects").length).to eq 1
  end

  it "only includes the same relationship once for has one through" do
    collection = Task.where(id: [task.id, task_with_same_project.id])
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection:, query_params: {preload: ["account", "project.account"]}).to_json)

    expect(result.dig!("data", "tasks").length).to eq 2
    expect(result.dig!("preloaded", "accounts", account.id.to_s, "a", "id")).to eq account.id
    expect(result.dig!("preloaded", "accounts").length).to eq 1
  end

  it "applies the scope of the original relationship on has-many-relationships" do
    account = create(:account)
    create(:project, account:, deleted_at: 5.minutes.ago)

    collection = Account.where(id: [account.id])
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection:, query_params: {preload: ["projects"]}).to_json)

    expect(result.dig!("data", "accounts").length).to eq 1
    expect(result.dig!("preloaded", "accounts", account.id.to_s, "r", "projects")).to eq []
  end

  it "applies the scope of the original relationship on has-one-relationships" do
    project = create(:project)
    create(:project_detail, deleted_at: 5.minutes.ago, project:)

    collection = Project.where(id: [project.id])
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection:, query_params: {preload: ["project_detail"]}).to_json)

    expect(result.dig!("data", "projects").length).to eq 1
    expect(result.dig!("preloaded", "projects", project.id.to_s, "r", "project_detail")).to be_nil
  end

  it "selects given columns in the database query" do
    project = create(:project)
    collection = Project.where(id: [project.id])
    collection_serializer = ApiMaker::CollectionSerializer.new(
      collection:,
      query_params: {
        preload: nil,
        select: {
          "project" => ["id"]
        },
        select_columns: {"project" => ["id"]}
      }
    )
    result = JSON.parse(collection_serializer.to_json)
    selects = collection_serializer.parsed_collection.values[:select]

    expect(selects.length).to eq 1
    expect(selects.first.name).to eq "id"
    expect(result.dig!("preloaded", "projects", project.id.to_s, "a", "id")).to eq project.id
  end

  it "automatically selects the right columns even if constrained" do
    user = create :user, first_name: "Donald", last_name: "Duck"
    collection = User.where(id: [user.id])
    collection_serializer = ApiMaker::CollectionSerializer.new(
      collection:,
      query_params: {
        preload: nil,
        select: {
          "user" => ["id", "name"]
        },
        select_columns: {"user" => ["id"]}
      }
    )
    result = JSON.parse(collection_serializer.to_json)
    selects = collection_serializer.parsed_collection.values[:select].map(&:name)

    expect(selects).to eq ["id", "first_name", "last_name"]
    expect(result.dig!("preloaded", "users", user.id.to_s, "a")).to eq("id" => 5, "name" => "Donald Duck")
  end

  it "automatically selects columns when the `columns` argument isnt given" do
    user = create :user, first_name: "Donald", last_name: "Duck"
    collection = User.where(id: [user.id])
    collection_serializer = ApiMaker::CollectionSerializer.new(
      collection:,
      query_params: {
        preload: nil,
        select: {
          "user" => ["id", "first_name"]
        },
        select_columns: {"user" => ["id"]}
      }
    )
    result = JSON.parse(collection_serializer.to_json)
    selects = collection_serializer.parsed_collection.values[:select].map(&:name)

    expect(selects).to eq ["id", "first_name"]
    expect(result.dig!("preloaded", "users", user.id.to_s, "a")).to eq("id" => 5, "first_name" => "Donald")
  end
end
