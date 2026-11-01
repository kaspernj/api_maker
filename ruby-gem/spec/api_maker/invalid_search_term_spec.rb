require "rails_helper"

describe "api maker - invalid Ransack search term", type: :request do
  include Devise::Test::IntegrationHelpers

  let(:user) { create(:user) }
  let!(:task) { create(:task, user:) }
  let(:csrf_token) do
    post "/api_maker/session_statuses"
    response.parsed_body.fetch("csrf_token")
  end

  before do
    host! "127.0.0.1"
    sign_in user
    csrf_token
  end

  def post_index(search_term, id: "1")
    post "/api_maker/commands",
      params: {pool: {index: {tasks: {"tasks-index" => {id => {args: {q: search_term}, id:, primary_key: user.id}}}}}},
      headers: {"X-CSRF-Token" => csrf_token}
  end

  # STOE-199: a Ruby client sent q[:accessible_from_lte] to a competitions index
  # command. Ransack has no "lte" predicate (Constants::AREL_PREDICATES are
  # eq, not_eq, matches, does_not_match, lt, lteq, gt, gteq, in, not_in), and
  # with config.ignore_unknown_conditions = false an unknown q key raises
  # Ransack::InvalidSearchError in ApiMaker::CollectionLoader#set_query instead
  # of being skipped. That is a rejected client payload, not a server failure:
  # it must answer as a named per-command error and must not file a bug report.
  it "answers a search term Ransack cannot resolve with a named per-command error" do
    post_index({created_at_lte: 1.day.ago})

    expect(response).to have_http_status(:ok)

    command_response = response.parsed_body.fetch("responses").fetch("1")
    expect(command_response.fetch("type")).to eq("error")
    expect(command_response.fetch("data").fetch("error_type")).to eq("invalid_search_term")

    error = command_response.fetch("data").fetch("errors").fetch(0)
    expect(error.fetch("type")).to eq("invalid_search_term")
    # The message names the offending key so the caller can fix the predicate
    # it built. In local requests it also names the exception class.
    expect(error.fetch("message")).to include("created_at_lte")
  end

  it "logs the rejection with attribution and bumps the counter instead of reporting an application error" do
    allow(ApiMaker::Configuration.current).to receive(:report_error)

    before_count = ApiMaker::BaseCommand.invalid_search_term_count

    post_index({created_at_lte: 1.day.ago})

    expect(response).to have_http_status(:ok)
    expect(ApiMaker::BaseCommand.invalid_search_term_count).to eq(before_count + 1)
    expect(ApiMaker::Configuration.current).not_to have_received(:report_error)
  end

  it "runs the rest of the batch when one index command carries an invalid search term" do
    post "/api_maker/commands", params: {pool: {index: {tasks: {"tasks-index" => {
      "1" => {args: {q: {created_at_lte: 1.day.ago}}, id: "1", primary_key: user.id},
      "2" => {args: {q: {created_at_lteq: 1.day.from_now}}, id: "2", primary_key: user.id}
    }}}}}, headers: {"X-CSRF-Token" => csrf_token}

    expect(response).to have_http_status(:ok)

    responses = response.parsed_body.fetch("responses")
    expect(responses.fetch("1").fetch("type")).to eq("error")
    expect(responses.fetch("1").fetch("data").fetch("error_type")).to eq("invalid_search_term")
    expect(responses.fetch("2").fetch("type")).to eq("success")
    expect(responses.fetch("2").fetch("data").fetch("collection").fetch("data").fetch("tasks")).to eq [task.id]
  end

  it "still answers a valid search term normally" do
    post_index({created_at_lteq: 1.day.from_now})

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body.fetch("responses").fetch("1").fetch("type")).to eq("success")
    expect(response.parsed_body.fetch("responses").fetch("1").fetch("data").fetch("collection").fetch("data").fetch("tasks")).to eq [task.id]
  end
end
