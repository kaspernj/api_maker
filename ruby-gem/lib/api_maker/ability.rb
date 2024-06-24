class ApiMaker::Ability
  include CanCan::Ability

  attr_reader :api_maker_args, :loader

  def initialize(api_maker_args: nil, locals: nil)
    @api_maker_args = api_maker_args || {}
    @locals = locals || api_maker_args&.dig(:locals) || {}
    @loader = ApiMaker::AbilityLoader.new(ability: self, locals:, api_maker_args:)
  end

  # Override methods from CanCan::Ability to first load abilities from the given resource
  def can?(*args)
    subject = args.second
    load_abilities(subject)
    super
  rescue ActiveModel::MissingAttributeError => e
    if subject.is_a?(ActiveRecord::Base)
      # Add subject / model class name to the error message
      new_error = ActiveModel::MissingAttributeError.new("Error on #{subject.class.name}: #{e.message}")
      new_error.set_backtrace(e.backtrace)

      raise new_error
    end

    raise e
  end

  def model_adapter(*args)
    subject = args.first
    load_abilities(subject)
    super
  end

  def load_abilities(subject)
    return unless active_record?(subject)

    if subject.class == Class # rubocop:disable Style/ClassEqualityComparison
      ApiMaker::Configuration.profile(-> { "Loading abilities for #{subject.name}" }) do
        loader.load_model_class(subject)
      end
    elsif subject.class != Class
      ApiMaker::Configuration.profile(-> { "Loading abilities for #{subject.class.name}" }) do
        loader.load_model_class(subject.class)
      end
    end
  end

  def active_record?(subject)
    return subject < ActiveRecord::Base if subject.class == Class # rubocop:disable Style/ClassEqualityComparison

    subject.is_a?(ActiveRecord::Base)
  end
end
