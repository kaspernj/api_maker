class ApiMaker::BaseService < ServicePattern::Service
  attr_reader :args, :current_ability

  def initialize(ability:, args:)
    @args = args
    @current_ability = ability
  end

  def execute
    raise "No 'execute' method defined"
  end
end
