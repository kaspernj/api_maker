require "rails_helper"

describe "api maker - unknown select attribute", type: :request do
  include Devise::Test::IntegrationHelpers

  let(:user) { create(:user) }
  let(:task) { create(:task, user:) }
  let(:csrf_token) do
    post "/api_maker/session_statuses"
    response.parsed_body.fetch("csrf_token")
  end

  before do
    host! "127.0.0.1"
    sign_in user
    csrf_token
  end

  def post_commands(pool)
    post "/api_maker/commands", params: {pool:}, headers: {"X-CSRF-Token" => csrf_token}
  end

  def index_pool(select)
    {index: {tasks: {"tasks-index" => {"1" => {args: {select:}, id: 1, primary_key: task.id}}}}}
  end

  it "answers 400 naming the resource and the attribute when a select asks for an unknown attribute" do
    post_commands(index_pool({"tasks" => ["id", "nonexistent_column"]}))

    expect(response).to have_http_status(:bad_request)

    body = response.parsed_body.fetch("errors").fetch(0)
    expect(body.fetch("type")).to eq("unknown_select_attribute")
    expect(body.fetch("message")).to include("Attribute not found on the Task resource: nonexistent_column")
  end

  it "rejects the request before any command runs and bumps the rejection counter" do
    before_count = ApiMaker::SelectParser.unknown_select_attribute_count

    post_commands(index_pool({"tasks" => ["nonexistent_column"]}))

    expect(response).to have_http_status(:bad_request)
    expect(ApiMaker::SelectParser.unknown_select_attribute_count).to eq(before_count + 1)
  end

  it "answers 200 with the selected data when the attribute is exposed on the resource" do
    post_commands(index_pool({"tasks" => ["id", "name"]}))

    expect(response).to have_http_status(:ok)

    data = response.parsed_body.dig("responses", "1", "data")
    attributes = data.dig("collection", "preloaded", "tasks", task.id.to_s, "a")
    expect(attributes["id"]).to eq task.id
    expect(attributes["name"]).to eq task.name
  end
end
