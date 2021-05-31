class ApiMaker::BaseService < ServicePattern::Service
  ApiMaker::IncludeHelpers.execute!(klass: self)

  attr_reader :args, :api_maker_args, :controller, :current_ability

  delegate :request, allow_nil: true, to: :controller

  def initialize(ability: nil, args: {}, api_maker_args: {}, controller: nil)
    @args = args
    @api_maker_args = api_maker_args
    @controller = controller
    @current_ability = ability
  end
end
