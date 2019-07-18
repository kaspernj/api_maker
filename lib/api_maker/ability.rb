class ApiMaker::Ability
  include CanCan::Ability

  attr_reader :loader

  def initialize(args: nil)
    @args = args
    @loader = ApiMaker::AbilityLoader.new(ability: self, args: args)
  end

  # Override methods from CanCan::Ability to first load abilities from the given resource
  def model_adapter(*args, &blk)
    model_class = args.first
    loader.load_model_class(model_class) if model_class < ActiveRecord::Base
    super(*args, &blk)
  end
end
