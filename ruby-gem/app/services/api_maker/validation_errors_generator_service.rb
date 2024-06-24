class ApiMaker::ValidationErrorsGeneratorService < ApiMaker::ApplicationService
  attr_reader :model, :params, :result

  def initialize(model:, params:)
    @model = model
    @params = params
    @result = []
  end

  def perform
    path = [model.model_name.singular]

    inspect_model(model, path)
    inspect_params(model, params, path)
    ServicePattern::Response.new(result:)
  end

  def inspect_model(model, path)
    return if model.errors.empty?

    model.errors.details.each_key do |attribute_name|
      # Errors on nested attributes contain dots - they should be caught here again later when scanning the nested relationship
      next if attribute_name.to_s.include?(".")

      attribute_type = attribute_type(model, attribute_name)

      attribute_path = path + [attribute_name]
      input_name = path_to_attribute_name(attribute_path)

      error_data = {
        attribute_name:,
        attribute_type:,
        id: model.id,
        model_name: model.model_name.param_key,
        error_messages: model.errors.messages.fetch(attribute_name).to_a,
        error_types: model.errors.details.fetch(attribute_name).map do |error|
          error = error.fetch(:error)

          if error.is_a?(Symbol)
            error
          else
            :custom_error
          end
        end
      }

      if attribute_type == :base
        # Remove duplicates coming from reflections that Rails might have added because of autosave
        remove_duplicate_errors_from_reflections(result, error_data)
      else
        error_data[:input_name] = input_name
      end

      result << error_data
    end
  end

  def remove_duplicate_errors_from_reflections(result, error_data)
    result.reject! do |other_error_data|
      other_error_data[:attribute_name] != :base &&
        other_error_data[:attribute_type] == :reflection &&
        other_error_data[:error_messages] == error_data[:error_messages]
    end
  end

  def attribute_type(model, attribute_name)
    if model.attribute_names.include?(attribute_name.to_s)
      :attribute
    elsif model.class.const_defined?(:ADDITIONAL_ATTRIBUTES_FOR_VALIDATION_ERRORS) &&
        model.class.const_get(:ADDITIONAL_ATTRIBUTES_FOR_VALIDATION_ERRORS).include?(attribute_name)
      :additional_attribute_for_validation
    elsif model._reflections.key?(attribute_name.to_s)
      :reflection
    elsif model.class.try(:monetized_attributes)&.include?(attribute_name.to_s)
      :monetized_attribute
    elsif attribute_name == :base
      :base
    end
  end

  def error_type(attribute_type, error)
    if attribute_type == :base
      :base
    else
      error.fetch(:error)
    end
  end

  def inspect_params(model, params, path)
    params.each do |attribute_name, attribute_value|
      match = attribute_name.match(/\A(.+)_attributes\Z/)
      next unless match

      association_name = match[1].to_sym
      association = model.association(association_name)

      path << attribute_name

      if attribute_value.is_a?(Array)
        check_nested_many_models_for_validation_errors_on_array(association.target, attribute_value, path)
      elsif all_keys_numeric?(attribute_value)
        # This is a has-many relationship where keys are mapped to attributes
        check_nested_many_models_for_validation_errors(association.target, attribute_value, path)
      else
        inspect_model(association.target, path)
        inspect_params(association.target, attribute_value, path)
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

  def check_nested_many_models_for_validation_errors_on_array(models_up_next, attribute_value, path)
    if models_up_next.length != attribute_value.length
      raise "Expected same length on targets and attribute values: #{models_up_next.length}, #{attribute_value.length}"
    end

    count = 0
    attribute_value.each_with_index do |model_attribute_values, unique_key|
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
