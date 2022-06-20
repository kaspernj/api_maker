class ApiMaker::Models::Save < ApiMaker::ApplicationService
  attr_reader :models, :simple_model_errors, :succeed_with_errors

  def initialize(models:, succeed_with_errors: false, simple_model_errors: false)
    @models = models
    @simple_model_errors = simple_model_errors
    @succeed_with_errors = succeed_with_errors
  end

  def perform
    errors = []
    failed = false
    failed_models = []

    first_model.transaction do
      each_model_with_params do |model, params|
        model.assign_attributes(params) if params

        next if model.save

        if simple_model_errors
          errors += ApiMaker::SimpleModelErrors.execute!(model: model)
        else
          errors += model.errors.full_messages
        end

        failed = true
        failed_models << {model: model, params: params}

        # The other models might be dependent on this one saving and it could lead to actual crashes and not just validation errors
        break if failed
      end

      raise ActiveRecord::Rollback if errors.any?
    end

    fail! errors.uniq if errors.any? && !succeed_with_errors

    succeed!(
      failed: failed,
      failed_models: failed_models,
      errors: errors
    )
  end

  def each_model_with_params
    models.each do |model_or_hash|
      if model_or_hash.is_a?(Hash)
        params = model_or_hash.fetch(:params)
        model = model_or_hash.fetch(:model)
      else
        model = model_or_hash
      end

      yield model, params
    end
  end

  def first_model
    each_model_with_params do |model| # rubocop:disable Lint/UnreachableLoop
      return model
    end

    raise "Couldn't find first model"
  end
end
