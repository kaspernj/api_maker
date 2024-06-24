class ApiMaker::SpecHelper::ExecuteCollectionCommand < ApiMaker::ApplicationService
  include RSpec::Mocks::ExampleMethods

  attr_reader :api_maker_args, :args, :command, :model_class

  def initialize(ability: nil, api_maker_args: {}, args: {}, command:, fake_controller: nil, model_class:)
    @ability = ability
    @api_maker_args = api_maker_args
    @args = args
    @command = command
    @fake_controller = fake_controller
    @model_class = model_class
  end

  def perform
    helper_command
    helper.execute!
    succeed! helper_command.result
  end

  def ability
    @ability ||= ApiMaker::Ability.new(api_maker_args:)
  end

  def fake_controller
    @fake_controller ||= instance_double(
      ApiMaker::BaseController,
      api_maker_args:,
      current_ability: ability
    )
  end

  def helper
    @helper ||= ApiMaker::CommandSpecHelper.new(
      collection: model_class,
      command:,
      controller: fake_controller
    )
  end

  def helper_command
    @helper_command ||= helper.add_command(
      args:
    )
  end
end
