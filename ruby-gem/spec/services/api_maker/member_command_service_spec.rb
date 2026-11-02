require "rails_helper"

describe ApiMaker::MemberCommandService do
  let(:user) { create :user }
  let(:ability) { ApiMaker::Ability.new(api_maker_args: {current_user: user}) }
  let(:command_response) { ApiMaker::CommandResponse.new(controller:) }
  let(:controller) { instance_double(ApplicationController, api_maker_args: {}, current_ability: ability) }

  it "raises UnknownCommandError when the command constant does not exist" do
    expect do
      ApiMaker::MemberCommandService.execute!(
        ability:,
        api_maker_args: {},
        commands: {
          # Executor-normalized shape: command entries use string keys
          # (MemberCommandService#ids fetches "primary_key").
          9 => {
            "args" => {},
            "id" => 9,
            "primary_key" => 1
          }
        },
        command_name: "nonexistent_member",
        command_response:,
        controller:,
        resource_name: "Tasks"
      )
    end.to raise_error(ApiMaker::UnknownCommandError, /Commands::Tasks::NonexistentMember/)
  end
end
