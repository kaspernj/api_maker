require "rails_helper"

describe ApiMaker::PreloaderBelongsTo do
  let!(:account) { create :account, customer: customer, id: 1 }
  let!(:customer) { create :customer, id: 5, name: "Test customer" }
  let!(:project) { create :project, account: account, id: 2, name: "Test project" }
  let!(:project_detail) { create :project_detail, project: project, id: 6, details: "Test project details" }
  let!(:task) { create :task, id: 3, name: "Test task", project: project, user: user }
  let!(:user) { create :user, id: 4 }
  let(:ability) { ApiMaker::Ability.new(args: args) }
  let(:args) { {current_user: user} }

  let(:task_with_same_project) { create :task, project: project }

  it "applies the scope of the original relationship on belongs-to-relationships" do
    account = create(:account, deleted_at: 5.minutes.ago)
    project = create(:project, account: account)

    collection = Project.where(id: [project.id])
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, query_params: {include: ["account"]}).to_json)

    expect(result.fetch("data").fetch("projects").length).to eq 1
    expect(result.fetch("preloaded").fetch("projects").fetch(project.id.to_s).fetch("r").fetch("account")).to eq nil
  end

  it "selects the given database columns" do
    collection = Project.where(id: [project.id])

    collection_serializer = ApiMaker::CollectionSerializer.new(
      collection: collection,
      query_params: {
        include: ["account"],
        select_columns: {
          "account" => ["id"]
        }
      }
    )

    attributes = collection_serializer
      .result
      .dig!(:preloaded, "accounts", account.id)
      .model
      .attributes

    expect(attributes).to eq("id" => account.id)
  end
end
