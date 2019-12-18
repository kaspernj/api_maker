class ApiMaker::ValidationErrorsGeneratorService < ApiMaker::ApplicationService
  attr_reader :model, :params, :result

  def initialize(model:, params:)
    @model = model
    @params = params
    @result = {}
  end

  def execute
    inspect_model(model, "root", nil)
    inspect_params(model, params)
    ServicePattern::Response.new(result: result)
  end

  def inspect_model(model, finder, finder_value) # rubocop:disable Metrics/AbcSize
    return if model.errors.empty?

    model_name = model.model_name.plural
    model_attribute_names = model.attribute_names
    model_reflection_names = model._reflections.keys

    model.errors.details.each do |attribute_name, errors|
      next if !model_attribute_names.include?(attribute_name.to_s) && !model_reflection_names.include?(attribute_name.to_s)

      errors.each_with_index do |error, error_index|
        result[model_name] ||= []

        model_result = result[model_name].find do |model_result_i|
          model_result_i.fetch(:finder) == finder &&
            model_result_i.fetch(:finder_value) == finder_value
        end

        unless model_result
          model_result ||= {
            finder: finder,
            finder_value: finder_value,
            id: model.id
          }
          result[model_name] << model_result
        end

        model_result[:attributes] ||= {}
        model_result[:attributes][attribute_name] ||= []
        model_result[:attributes][attribute_name] << {
          message: model.errors.messages.fetch(attribute_name).fetch(error_index),
          type: error.fetch(:error)
        }
      end
    end
  end

  def inspect_params(model, params)
    params.each do |attribute_name, attribute_value|
      match = attribute_name.match(/\A(.+)_attributes\Z/)
      next unless match

      association_name = match[1].to_sym
      association = model.association(association_name)
      models_up_next = association.target

      if models_up_next.length != attribute_value.keys.length
        raise "Expected same length on targets and attribute values: #{models_up_next.length}, #{attribute_value.keys.length}"
      end

      count = 0
      attribute_value.each do |unique_key, model_attribute_values|
        model_up_next = models_up_next.fetch(count)
        count += 1

        inspect_model(model_up_next, "unique-key", unique_key)
        inspect_params(model_up_next, model_attribute_values)
      end
    end
  end
end
