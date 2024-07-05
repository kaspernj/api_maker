require "rails_helper"

describe ApiMaker::PreloaderBelongsTo do
  let!(:account) { create :account, customer:, id: 1 }
  let!(:customer) { create :customer, id: 5, name: "Test customer" }
  let!(:project) { create :project, account:, id: 2, name: "Test project" }
  let!(:project_detail) { create :project_detail, project:, id: 6, details: "Test project details" }
  let!(:task) { create :task, id: 3, name: "Test task", project:, user: }
  let!(:user) { create :user, id: 4 }
  let(:ability) { ApiMaker::Ability.new(api_maker_args: args) }
  let(:args) { {current_user: user} }

  let(:task_with_same_project) { create :task, project: }

  it "applies the scope of the original relationship on belongs-to-relationships" do
    account = create(:account, deleted_at: 5.minutes.ago)
    project = create(:project, account:)

    collection = Project.where(id: [project.id])
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection:, query_params: {preload: ["account"]}).to_json)

    expect(result.dig!("data", "projects").length).to eq 1
    expect(result.dig!("preloaded", "projects", project.id.to_s, "r", "account")).to be_nil
  end

  it "selects the given database columns" do
    collection = Project.where(id: [project.id])

    collection_serializer = ApiMaker::CollectionSerializer.new(
      collection:,
      query_params: {
        preload: ["account"],
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

  it "doesnt try to preload through database when none of the models has a relationship" do
    task.update!(user: nil)
    ability = ApiMaker::Ability.new
    collection = Task.where(id: task.id)
    reflection = Task.reflections.fetch("user")

    preloader = ApiMaker::PreloaderBelongsTo.new(
      ability:,
      api_maker_args: {},
      collection:,
      data: {},
      locals: {},
      records: collection.to_a,
      reflection:,
      select: nil,
      select_columns: nil
    )
    models = preloader.__send__(:models)

    expect(preloader.__send__(:look_up_values)).to eq []
    expect(models).to be_an Array
    expect(models).to be_empty
  end
end
