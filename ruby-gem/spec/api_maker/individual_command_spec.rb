require "rails_helper"

describe ApiMaker::IndividualCommand do
  let(:individual_command) do
    ApiMaker::IndividualCommand.new(
      id: 1,
      args: nil,
      collection: Task.all,
      command: Commands::Tasks::TestMember,
      primary_key: 25,
      response: nil
    )
  end

  describe "#model" do
    it "raises a human understandable error if no access" do
      expect { individual_command.model }.to raise_error(
        ApiMaker::IndividualCommand::NotFoundOrNoAccessError,
        "Couldn't find or no access to Task 25 on the Tasks::TestMember command"
      )
    end
  end
end
