class ApiMaker::BaseService < ServicePattern::Service
  ApiMaker::IncludeHelpers.execute!(klass: self)

  attr_reader :args, :controller

  delegate :request, allow_nil: true, to: :controller

  def initialize(ability: nil, args: {}, api_maker_args: nil, controller: nil)
    @args = args
    @api_maker_args = api_maker_args
    @controller = controller
    @ability = ability
  end

  def api_maker_args
    controller.__send__(:api_maker_args) || @api_maker_args
  end

  def api_maker_locals
    controller.__send__(:api_maker_locals)
  end

  def cookies
    controller.__send__(:cookies)
  end

  def current_ability
    controller.__send__(:current_ability) || @ability
  end

  def reset_current_ability
    controller.__send__(:reset_current_ability)
  end
end
