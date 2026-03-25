require "rails_helper"

describe ApiMaker::PermittedParamsArgument do
  describe "#params" do
    it "returns an empty hash if nothing is given" do
      command = ApiMaker::IndividualCommand.new(
        args: nil,
        collection: nil,
        command: nil,
        id: 5,
        primary_key: 10,
        response: nil
      )
      permitted_params_argument = ApiMaker::PermittedParamsArgument.new(command:, model: nil)

      expect(permitted_params_argument.params).to eq(ActionController::Parameters.new)
    end

    it "wraps hash arguments in action controller parameters" do
      command = ApiMaker::IndividualCommand.new(
        args: {
          save: {
            "user" => {
              "first_name" => "Ada"
            }
          }
        },
        collection: nil,
        command: nil,
        id: 5,
        primary_key: 10,
        response: nil
      )
      permitted_params_argument = ApiMaker::PermittedParamsArgument.new(command:, model: nil)

      expect(permitted_params_argument.params).to eq(
        ActionController::Parameters.new(
          "user" => {
            "first_name" => "Ada"
          }
        )
      )
    end
  end
end
