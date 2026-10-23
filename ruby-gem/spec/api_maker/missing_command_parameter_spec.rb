require "rails_helper"

describe "api maker - missing command parameters", type: :request do
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

  def update_entry(args:, id:)
    {args:, id:, primary_key: user.id}
  end

  # STC-686: an update command whose payload has no model key (here: no "user")
  # made the resource's params.require(:user) raise ActionController::ParameterMissing
  # inside the command. That must stay a per-command error naming the missing
  # parameter — not an escaped exception and not a server-side bug report.
  it "answers with a named per-command error when the update payload is missing the model parameter" do
    post_commands({update: {users: {"users-update" => {"1" => update_entry(args: {}, id: 1)}}}})

    expect(response).to have_http_status(:ok)

    command_response = response.parsed_body.fetch("responses").fetch("1")
    expect(command_response.fetch("type")).to eq("error")
    expect(command_response.fetch("data").fetch("error_type")).to eq("missing_parameter")

    error = command_response.fetch("data").fetch("errors").fetch(0)
    expect(error.fetch("type")).to eq("missing_parameter")
    # The message names the missing parameter. In local requests it also names
    # the exception class; both forms contain the parameter name.
    expect(error.fetch("message")).to include("user")
  end

  it "logs the rejection with attribution and bumps the counter instead of reporting an application error" do
    allow(ApiMaker::Configuration.current).to receive(:report_error)

    before_count = ApiMaker::BaseCommand.missing_parameter_count

    post_commands({update: {users: {"users-update" => {"1" => update_entry(args: {}, id: 1)}}}})

    expect(response).to have_http_status(:ok)
    expect(ApiMaker::BaseCommand.missing_parameter_count).to eq(before_count + 1)
    expect(ApiMaker::Configuration.current).not_to have_received(:report_error)
  end

  it "still runs a valid update normally" do
    post_commands({update: {users: {"users-update" => {"1" => update_entry(args: {save: {user: {email: "jane@example.com"}}}, id: 1)}}}})

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body.fetch("responses").fetch("1").fetch("type")).to eq("success")
    expect(user.reload.email).to eq "jane@example.com"
  end

  it "runs the rest of the batch when one command is missing its parameter" do
    post_commands({update: {users: {"users-update" => {
      "1" => update_entry(args: {}, id: 1),
      "2" => update_entry(args: {save: {user: {email: "frode@example.com"}}}, id: 2)
    }}}})

    expect(response).to have_http_status(:ok)

    responses = response.parsed_body.fetch("responses")
    expect(responses.fetch("1").fetch("type")).to eq("error")
    expect(responses.fetch("1").fetch("data").fetch("error_type")).to eq("missing_parameter")
    expect(responses.fetch("2").fetch("type")).to eq("success")
    expect(user.reload.email).to eq "frode@example.com"
  end
end
