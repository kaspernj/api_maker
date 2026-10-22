require "rails_helper"

describe "api maker - malformed command requests", type: :request do
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
    post "/api_maker/commands", params: {pool:}, headers: {"X-CSRF-Token" => csrf_token}
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

  it "bumps the rejection counter for each rejected request and leaves valid requests out of it" do
    before_count = ApiMaker::CommandRequestExecutor.malformed_request_count

    post_commands({collection: {tasks: {test_collection: "not-a-hash"}}})
    expect(response).to have_http_status(:bad_request)
    expect(ApiMaker::CommandRequestExecutor.malformed_request_count).to eq(before_count + 1)

    post_commands({collection: {tasks: {test_collection: [{args: {}, id: 1}]}}})
    expect(response).to have_http_status(:bad_request)
    expect(ApiMaker::CommandRequestExecutor.malformed_request_count).to eq(before_count + 2)

    post_commands({collection: {tasks: {test_collection: {"1" => {args: {}, id: 1}}}}})
    expect(response).to have_http_status(:ok)
    expect(ApiMaker::CommandRequestExecutor.malformed_request_count).to eq(before_count + 2)
  end

  # STC-648: an older client sends the previous envelope where a command name
  # carries an Array of entries instead of the id => entry Hash. Array#to_h on
  # that shape used to crash with TypeError mid-request; it must be a named 400.
  it "answers 400 when a command name carries the old array-of-entries envelope" do
    post_commands({collection: {tasks: {test_collection: [{args: {}, id: 1}]}}})

    expect(response).to have_http_status(:bad_request)

    body = response.parsed_body.fetch("errors").fetch(0)
    expect(body.fetch("type")).to eq("malformed_command_request")
    expect(body.fetch("message")).to include("command name at 'pool -> collection -> tasks -> test_collection'")
    expect(body.fetch("message")).to include("must be a Hash, got Array")
  end

  it "runs valid commands normally" do
    post_commands({collection: {tasks: {test_collection: {"1" => {args: {}, id: 1}}}}})

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body.fetch("responses").fetch("1").fetch("type")).to eq("success")
  end
end
