class ApiMaker::BaseService < ServicePattern::Service
  attr_reader :args, :api_maker_args, :controller, :current_ability

  def initialize(ability: nil, args: {}, api_maker_args: {}, controller: nil)
    @args = args
    @api_maker_args = api_maker_args
    @controller = controller
    @current_ability = ability
  end

  def execute
    raise "No 'execute' method defined"
  end
end
