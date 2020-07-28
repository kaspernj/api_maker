class ApiMaker::Ability
  include CanCan::Ability

  attr_reader :loader

  def initialize(args: nil, locals:)
    @args = args
    @locals = locals
    @loader = ApiMaker::AbilityLoader.new(ability: self, locals: locals, args: args)
  end

  # Override methods from CanCan::Ability to first load abilities from the given resource
  def can?(*args)
    subject = args.second
    load_abilities(subject)
    super
  end

  def model_adapter(*args)
    subject = args.first
    load_abilities(subject)
    super
  end

  def load_abilities(subject)
    return unless active_record?(subject)

    if subject.class == Class
      loader.load_model_class(subject)
    elsif subject.class != Class
      loader.load_model_class(subject.class)
    end
  end

  def active_record?(subject)
    return subject < ActiveRecord::Base if subject.class == Class

    subject.is_a?(ActiveRecord::Base)
  end
end
