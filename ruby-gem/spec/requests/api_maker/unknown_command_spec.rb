require "rails_helper"

describe "api maker - unknown commands" do
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

  it "answers 400 naming the command when a member command constant does not exist" do
    post_commands({member: {tasks: {nonexistent_member: {"1" => {args: {}, id: 1}}}}})

    expect(response).to have_http_status(:bad_request)

    body = response.parsed_body.fetch("errors").fetch(0)
    expect(body.fetch("type")).to eq("unknown_command")
    expect(body.fetch("message")).to include("Commands::Tasks::NonexistentMember")
  end

  it "answers 400 when a collection command constant does not exist" do
    post_commands({collection: {tasks: {nonexistent_collection: {"1" => {args: {}, id: 1}}}}})

    expect(response).to have_http_status(:bad_request)

    body = response.parsed_body.fetch("errors").fetch(0)
    expect(body.fetch("type")).to eq("unknown_command")
    expect(body.fetch("message")).to include("Commands::Tasks::NonexistentCollection")
  end

  it "bumps the rejection counter for each rejected request and leaves valid requests out of it" do
    before_count = ApiMaker::CommandRequestExecutor.unknown_command_count

    post_commands({member: {tasks: {nonexistent_member: {"1" => {args: {}, id: 1}}}}})
    expect(ApiMaker::CommandRequestExecutor.unknown_command_count).to eq(before_count + 1)

    post_commands({collection: {tasks: {nonexistent_collection: {"1" => {args: {}, id: 1}}}}})
    expect(ApiMaker::CommandRequestExecutor.unknown_command_count).to eq(before_count + 2)

    post_commands({collection: {tasks: {test_collection: {"1" => {args: {}, id: 1}}}}})
    expect(response).to have_http_status(:ok)
    expect(ApiMaker::CommandRequestExecutor.unknown_command_count).to eq(before_count + 2)
  end

  it "runs valid member and collection commands normally" do
    task = create(:task, user:)

    post_commands({
      collection: {tasks: {test_collection: {"1" => {args: {}, id: 1}}}},
      member: {tasks: {test_member: {"2" => {args: {}, id: 2, primary_key: task.id}}}}
    })

    expect(response).to have_http_status(:ok)

    responses = response.parsed_body.fetch("responses")
    expect(responses.fetch("1")).to include(type: "success")
    expect(responses.fetch("2")).to include(type: "success")
  end
end
