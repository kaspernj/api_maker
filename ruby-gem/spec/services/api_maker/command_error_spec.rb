require "rails_helper"

describe ApiMaker::CommandError do
  it "classifies missing parameters as a dedicated, non-runtime error type" do
    error = ActionController::ParameterMissing.new("user_step")

    expect(ApiMaker::BaseCommand.command_error_type(error)).to eq(:missing_parameter)
  end

  it "names the missing parameter in the message in non-local requests" do
    allow(Rails.application.config).to receive(:consider_all_requests_local).and_return(false)
    error = ActionController::ParameterMissing.new("user_step")

    expect(ApiMaker::BaseCommand.command_error_message(error)).to eq("This request was missing a required parameter: user_step")
  end

  it "logs a missing parameter error with attribution and bumps the counter" do
    before_count = ApiMaker::BaseCommand.missing_parameter_count
    request = instance_double(ActionDispatch::Request, path: "/api_maker/commands", request_method: "POST", user_agent: "Ruby")
    controller = instance_double(ApiMaker::BaseController, request:)
    error = ActionController::ParameterMissing.new("user_step")

    expect(Rails.logger).to receive(:warn) do |message|
      expect(message).to include("api_maker_missing_command_parameter")
      expect(message).to include("param=\"user_step\"")
      expect(message).to include("user_agent=\"Ruby\"")
    end

    ApiMaker::BaseCommand.log_missing_parameter_error(error, controller:)

    expect(ApiMaker::BaseCommand.missing_parameter_count).to eq(before_count + 1)
  end

  # STOE-199: Ransack 3 (the version this repo's Gemfile.lock resolves) raises a
  # bare ArgumentError for an unresolvable q key; Ransack 4+ raises
  # Ransack::InvalidSearchError with the same message. Both are covered.
  it "classifies an unresolvable Ransack search term as a dedicated, non-runtime error type" do
    error = ArgumentError.new("Invalid search term created_at_lte")

    expect(ApiMaker::BaseCommand.command_error_type(error)).to eq(:invalid_search_term)
  end

  it "classifies a valid attribute with an unknown predicate the same way" do
    error = ArgumentError.new("No valid predicate for created_at_lte")

    expect(ApiMaker::BaseCommand.command_error_type(error)).to eq(:invalid_search_term)
  end

  it "classifies Ransack's own error class when the installed Ransack defines it", if: defined?(Ransack::InvalidSearchError) do
    error = Ransack::InvalidSearchError.new("Invalid search term accessible_from_lte")

    expect(ApiMaker::BaseCommand.command_error_type(error)).to eq(:invalid_search_term)
  end

  it "keeps an unrelated ArgumentError a runtime error" do
    error = ArgumentError.new("Expected table and column but array length was wrong: 3")

    expect(ApiMaker::BaseCommand.command_error_type(error)).to eq(:runtime_error)
  end

  it "names the offending search term in the message in non-local requests" do
    allow(Rails.application.config).to receive(:consider_all_requests_local).and_return(false)
    error = ArgumentError.new("Invalid search term created_at_lte")

    expect(ApiMaker::BaseCommand.command_error_message(error)).to eq(
      "This request used a search term that is not valid for this collection: created_at_lte"
    )
  end

  it "logs an invalid search term with attribution and bumps the counter" do
    before_count = ApiMaker::BaseCommand.invalid_search_term_count
    request = instance_double(ActionDispatch::Request, path: "/api_maker/commands", request_method: "POST", user_agent: "Ruby")
    controller = instance_double(ApiMaker::BaseController, request:)
    error = ArgumentError.new("Invalid search term created_at_lte")

    expect(Rails.logger).to receive(:warn) do |message|
      expect(message).to include("api_maker_invalid_search_term")
      expect(message).to include("search_term=\"created_at_lte\"")
      expect(message).to include("user_agent=\"Ruby\"")
    end

    ApiMaker::BaseCommand.log_invalid_search_term_error(error, controller:)

    expect(ApiMaker::BaseCommand.invalid_search_term_count).to eq(before_count + 1)
  end
end
