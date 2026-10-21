require "rails_helper"

describe "api maker - malformed command requests" do
  include Devise::Test::IntegrationHelpers

  let(:user) { create(:user) }
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
    post "/api_maker/commands", params: {pool: pool}, headers: {"X-CSRF-Token" => csrf_token}
  end

  it "answers 400 naming the path and class when a command name is a String" do
    post_commands({collection: {tasks: {test_collection: "not-a-hash"}}})

    expect(response).to have_http_status(:bad_request)

    body = response.parsed_body.fetch("errors").fetch(0)
    expect(body.fetch("type")).to eq("malformed_command_request")
    expect(body.fetch("message")).to include("command name at 'pool -> collection -> tasks -> test_collection'")
    expect(body.fetch("message")).to include("must be a Hash, got String")
  end

  it "answers 400 when a command entry is an Integer (Symbol indexing crash shape)" do
    post_commands({collection: {tasks: {test_collection: {"1" => 42}}}})

    expect(response).to have_http_status(:bad_request)

    body = response.parsed_body.fetch("errors").fetch(0)
    expect(body.fetch("type")).to eq("malformed_command_request")
    expect(body.fetch("message")).to include("command entry at 'pool -> collection -> tasks -> test_collection -> 1'")
    expect(body.fetch("message")).to include("must be a Hash, got Integer")
  end

  it "answers 400 when a deeper pool level is not a Hash" do
    post_commands({collection: {tasks: "not-a-hash"}})

    expect(response).to have_http_status(:bad_request)

    body = response.parsed_body.fetch("errors").fetch(0)
    expect(body.fetch("message")).to include("resource at 'pool -> collection -> tasks'")
    expect(body.fetch("message")).to include("must be a Hash, got String")
  end

  it "answers 400 when the pool itself is missing" do
    post "/api_maker/commands", params: {something_else: true}, headers: {"X-CSRF-Token" => csrf_token}

    expect(response).to have_http_status(:bad_request)

    body = response.parsed_body.fetch("errors").fetch(0)
    expect(body.fetch("message")).to include("pool at 'pool'")
    expect(body.fetch("message")).to include("must be a Hash, got NilClass")
  end

  it "runs valid commands normally" do
    post_commands({collection: {tasks: {test_collection: {"1" => {args: {}, id: 1}}}}})

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body.fetch("responses").fetch("1")).to include(type: "success")
  end
end
