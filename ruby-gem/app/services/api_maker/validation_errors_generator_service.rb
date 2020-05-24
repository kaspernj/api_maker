class ApiMaker::ValidationErrorsGeneratorService < ApiMaker::ApplicationService
  attr_reader :model, :params, :result

  def initialize(model:, params:)
    @model = model
    @params = params
    @result = []
  end

  def execute
    path = [model.model_name.singular]

    inspect_model(model, path)
    inspect_params(model, params, path)
    ServicePattern::Response.new(result: result)
  end

  def inspect_model(model, path)
    return if model.errors.empty?

    model.errors.details.each do |attribute_name, errors|
      next unless handle_attribute?(model, attribute_name)

      attribute_path = path + [attribute_name]
      input_name = path_to_attribute_name(attribute_path)

      errors.each_with_index do |error, error_index|
        result << {
          attribute_name: attribute_name,
          id: model.id,
          input_name: input_name,
          model_name: model.model_name.param_key,
          error_message: model.errors.messages.fetch(attribute_name).fetch(error_index),
          error_type: error.fetch(:error)
        }
      end
    end
  end

  def handle_attribute?(model, attribute_name)
    model.attribute_names.include?(attribute_name.to_s) ||
      model._reflections.key?(attribute_name.to_s) ||
      model.class.try(:monetized_attributes)&.include?(attribute_name.to_s)
  end

  def inspect_params(model, params, path)
    params.each do |attribute_name, attribute_value|
      match = attribute_name.match(/\A(.+)_attributes\Z/)
      next unless match

      association_name = match[1].to_sym
      association = model.association(association_name)

      path << attribute_name

      if all_keys_numeric?(attribute_value)
        # This is a has-many relationship where keys are mapped to attributes
        check_nested_many_models_for_validation_errors(association.target, attribute_value, path)
      else
        inspect_model(association.target, path)
      end

      path.pop
    end
  end

  def all_keys_numeric?(hash)
    hash.keys.all? { |key| key.to_s.match?(/\A\d+\Z/) }
  end

  def check_nested_many_models_for_validation_errors(models_up_next, attribute_value, path)
    if models_up_next.length != attribute_value.keys.length
      raise "Expected same length on targets and attribute values: #{models_up_next.length}, #{attribute_value.keys.length}"
    end

    count = 0
    attribute_value.each do |unique_key, model_attribute_values|
      model_up_next = models_up_next.fetch(count)
      count += 1

      path << unique_key
      inspect_model(model_up_next, path)
      inspect_params(model_up_next, model_attribute_values, path)
      path.pop
    end
  end

  def path_to_attribute_name(original_attribute_path)
    attribute_path = original_attribute_path.dup
    path_string = attribute_path.shift.dup

    attribute_path.each do |path_part|
      path_string << "[#{path_part}]"
    end

    path_string
  end
end
