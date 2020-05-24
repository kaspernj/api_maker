require "rails_helper"

describe ApiMaker::PreloaderHasOne do
  let(:account) { create :account, customer: customer }
  let(:customer) { create :customer, id: 8 }
  let(:project) { create :project, account: account }
  let(:project_detail) { create :project_detail, project: project }
  let(:task) { create :task, id: 6, project: project }

  it "sets the relationship to nil and doesnt crash when its preloaded but doesnt exist" do
    collection = Project.where(id: [project.id])
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, query_params: {preload: ["project_detail.accounts"]}).to_json)

    expect(result.dig!("preloaded", "projects", project.id.to_s, "r", "project_detail")).to eq nil
  end

  it "doesnt crash when trying to preload on an empty collection" do
    collection = Project.where(id: [project.id + 5])
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, query_params: {preload: ["project_detail.accounts"]}).to_json)

    expect(result).to eq("data" => {}, "preloaded" => {})
  end

  it "loads relationships through and with source" do
    collection = Task.where(id: task.id)
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, query_params: {preload: ["account_customer"]}).to_json)

    expect(result.dig!("preloaded", "tasks", "6", "r")).to eq("account_customer" => 8)
  end

  it "only select the give columns without a through relationship" do
    project_detail
    collection = Project.where(id: [project.id])

    collection_serializer = ApiMaker::CollectionSerializer.new(
      collection: collection,
      query_params: {
        preload: ["project_detail"],
        select_columns: {
          "project-detail" => ["id"]
        }
      }
    )

    attributes = collection_serializer
      .result
      .dig!(:preloaded, "project-details", project_detail.id)
      .model
      .attributes

    expect(attributes).to eq("api_maker_origin_id" => project.id, "id" => project_detail.id)
  end

  it "only select the give columns with a through relationship" do
    collection = Task.where(id: task.id)
    collection_serializer = ApiMaker::CollectionSerializer.new(
      collection: collection,
      query_params: {
        preload: ["account_customer"],
        select_columns: {
          "customer" => ["id"]
        }
      }
    )
    attributes = collection_serializer
      .result
      .dig!(:preloaded, "customers", customer.id)
      .model
      .attributes

    expect(attributes).to eq("api_maker_origin_id" => task.id, "id" => customer.id)
  end
end
