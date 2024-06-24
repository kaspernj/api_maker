class ApiMaker::SpecHelper::ExecuteMemberCommand < ApiMaker::ApplicationService
  include RSpec::Mocks::ExampleMethods

  attr_reader :api_maker_args, :args, :command, :model

  def initialize(ability: nil, api_maker_args: nil, collection: nil, command:, fake_controller: nil, model:, args: {})
    @ability = ability
    @api_maker_args = api_maker_args
    @args = args
    @collection = collection
    @command = command
    @fake_controller = fake_controller
    @model = model
  end

  def perform
    helper_command
    helper.execute!
    succeed! helper_command.result
  end

  def ability
    @ability ||= ApiMaker::Ability.new(api_maker_args:)
  end

  def collection
    @collection ||= model.class.where(id: model.id)
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
      collection:,
      command:,
      controller: fake_controller
    )
  end

  def helper_command
    @helper_command ||= helper.add_command(
      primary_key: model.id,
      args:
    )
  end
end
