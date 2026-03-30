require "rails_helper"

describe Commands::Workplaces::Current do
  let(:fake_user_class) do
    Class.new do
      attr_reader :id
      attr_accessor :current_workplace

      def initialize
        @id = 1
      end

      define_method(:with_advisory_lock!) { |_| false }

      def reload
        self
      end
    end
  end
  let(:ability) { ApiMaker::Ability.new(api_maker_args: {current_user:}) }
  let(:api_maker_args) { {current_session_id:, current_user:} }
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
  let(:current_user) { nil }
  let(:current_session_id) { nil }
  let(:controller) { controller_class.new(api_maker_args:, current_ability: ability, current_user:) }
  let(:helper) do
    ApiMaker::CommandSpecHelper.new(
      collection:,
      command: Commands::Workplaces::Current,
      controller:
    )
  end

  it "returns an empty current collection and zero links_count when there is no user or session" do
    command = helper.add_command(args: {links_count: {ransack: {}}})

    helper.execute!

    expect(command.result[:current]).to eq(
      "api_maker_type" => "collection",
      "data" => {},
      "preloaded" => {}
    )
    expect(command.result[:links_count]).to eq(0)
  end

  it "returns the current session workplace for guest requests" do
    guest_ability = ApiMaker::Ability.new(api_maker_args: {current_session_id: "session-1", current_user: nil})
    guest_controller = controller_class.new(
      api_maker_args: {current_session_id: "session-1", current_user: nil},
      current_ability: guest_ability,
      current_user: nil
    )
    guest_helper = ApiMaker::CommandSpecHelper.new(
      collection: WorkerPlugins::Workplace.accessible_by(guest_ability),
      command: Commands::Workplaces::Current,
      controller: guest_controller
    )
    command = guest_helper.add_command(args: {links_count: {ransack: {}}})

    guest_helper.execute!

    workplace = WorkerPlugins::Workplace.find_by!(session_id: "session-1")

    expect(command.result[:current]).to include("api_maker_type" => "collection")
    expect(command.result[:current].dig("data", "workplaces")).to eq([workplace.id])
    expect(command.result[:current].dig("preloaded", "workplaces", workplace.id.to_s, :a, :id)).to eq(workplace.id)
    expect(command.result[:links_count]).to eq(0)
  end

  it "fails when a signed-in user still has no current workplace" do
    signed_in_user = fake_user_class.new
    signed_in_ability = ApiMaker::Ability.new(api_maker_args: {current_session_id: nil, current_user: signed_in_user})
    signed_in_controller = controller_class.new(
      api_maker_args: {current_session_id: nil, current_user: signed_in_user},
      current_ability: signed_in_ability,
      current_user: signed_in_user
    )
    signed_in_helper = ApiMaker::CommandSpecHelper.new(
      collection: WorkerPlugins::Workplace.accessible_by(signed_in_ability),
      command: Commands::Workplaces::Current,
      controller: signed_in_controller
    )
    command = signed_in_helper.add_command(args: {links_count: {ransack: {}}})

    signed_in_helper.execute!

    expect(signed_in_helper.response.result.fetch(1).fetch(:type)).to eq(:failed)
    expect(command.result.fetch(:errors)).to eq(["Current workplace could not be loaded"])
  end
end
