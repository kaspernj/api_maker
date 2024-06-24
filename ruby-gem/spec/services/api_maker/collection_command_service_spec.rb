require "rails_helper"

describe ApiMaker::CollectionCommandService do
  let(:ability) { ApiMaker::Ability.new(api_maker_args: {current_user: user}) }
  let(:individual_command) do
    ApiMaker::IndividualCommand.new(
      args: {},
      collection: nil,
      command: nil,
      id: 9,
      response: nil
    )
  end
  let(:command_response) { ApiMaker::CommandResponse.new(controller:) }
  let(:controller) { instance_double(ApplicationController, api_maker_args: {}, current_ability: ability) }
  let(:user) { create :user }

  it "responds with an error when no access" do
    expect(ability).to receive(:can?).with(:test_collection, Task).and_return(false)

    ApiMaker::CollectionCommandService.execute!(
      ability:,
      api_maker_args: {},
      commands: {
        9 => {
          args: {},
          id: 9
        }
      },
      command_name: "test_collection",
      command_response:,
      controller:,
      resource_name: "Tasks"
    )

    expect(command_response.result).to eq(
      9 => {
        data: {
          errors: ["No access to 'test_collection' on 'Task'"],
          success: false
        },
        type: :error
      }
    )
  end
end
