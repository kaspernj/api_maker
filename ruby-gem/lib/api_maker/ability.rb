class ApiMaker::Ability
  include CanCan::Ability

  attr_reader :loader

  def initialize(api_maker_args: nil, locals: nil)
    @api_maker_args = api_maker_args || {}
    @locals = locals || api_maker_args&.dig(:locals) || {}
    @loader = ApiMaker::AbilityLoader.new(ability: self, locals: locals, api_maker_args: api_maker_args)
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

    if subject.class == Class # rubocop:disable Style/ClassEqualityComparison
      loader.load_model_class(subject)
    elsif subject.class != Class
      loader.load_model_class(subject.class)
    end
  end

  def active_record?(subject)
    return subject < ActiveRecord::Base if subject.class == Class # rubocop:disable Style/ClassEqualityComparison

    subject.is_a?(ActiveRecord::Base)
  end
end
