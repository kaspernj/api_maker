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

      expect(permitted_params_argument.params).to eq({})
    end
  end
end
