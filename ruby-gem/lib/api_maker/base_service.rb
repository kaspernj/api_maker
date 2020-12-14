class ApiMaker::BaseService < ServicePattern::Service
  attr_reader :args, :api_maker_args, :controller, :current_ability

  def initialize(ability:, args:, api_maker_args:, controller:)
    @args = args
    @api_maker_args = api_maker_args
    @controller = controller
    @current_ability = ability
  end

  def execute
    raise "No 'execute' method defined"
  end
end
