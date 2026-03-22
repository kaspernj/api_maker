require "rails_helper"

describe Commands::Workplaces::Current do
  let(:ability) { ApiMaker::Ability.new(api_maker_args: {current_user: nil}) }
  let(:api_maker_args) { {current_user: nil} }
  let(:collection) { WorkerPlugins::Workplace.accessible_by(ability) }
  let(:controller_class) do
    Class.new do
      attr_reader :api_maker_args, :current_ability, :current_user

      def initialize(api_maker_args:, current_ability:, current_user:)
        @api_maker_args = api_maker_args
        @current_ability = current_ability
        @current_user = current_user
      end
    end
  end
  let(:controller) { controller_class.new(api_maker_args:, current_ability: ability, current_user: nil) }
  let(:helper) do
    ApiMaker::CommandSpecHelper.new(
      collection:,
      command: Commands::Workplaces::Current,
      controller:
    )
  end

  it "returns an empty current collection and zero links_count when current_user is nil" do
    command = helper.add_command(args: {links_count: {ransack: {}}})

    helper.execute!

    expect(command.result[:current]).to eq(
      "api_maker_type" => "collection",
      "data" => {},
      "preloaded" => {}
    )
    expect(command.result[:links_count]).to eq(0)
  end
end
