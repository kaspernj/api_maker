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
end
