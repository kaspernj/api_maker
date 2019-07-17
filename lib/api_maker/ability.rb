class ApiMaker::Ability
  include CanCan::Ability

  attr_reader :loader

  def initialize(args: nil)
    @args = args
    @loader = ApiMaker::AbilityLoader.new(ability: self, args: args)
  end
end
