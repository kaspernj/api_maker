class ApiMaker::SimpleModelErrors < ApiMaker::ApplicationService
  attr_reader :additional_attributes, :errors, :model, :models_inspected

  def initialize(additional_attributes: [], model:)
    @additional_attributes = additional_attributes
    @model = model
    @errors = []
    @models_inspected = []
  end

  def perform
    inspect_model(model)
    succeed! errors
  end

  def inspect_model(model)
    return if models_inspected.include?(model)

    model.valid? if model.errors.empty? # Generates the errors on the model so we can detect them
    models_inspected << model

    model.errors.messages.each do |attribute_name, attribute_errors|
      if attribute_name == :base
        @errors += attribute_errors
      else
        next if model.attribute_names.exclude?(attribute_name.to_s) && additional_attributes.exclude?(attribute_name)

        attribute_errors.each do |message|
          errors << "#{model.class.human_attribute_name(attribute_name)} #{message}"
        end
      end
    end

    collect_errors_from_associations(sub_model)
  end

private

  def collect_errors_from_associations(model_to_scan_reflections_on)
    model_to_scan_reflections_on._reflections.each_key do |association_name|
      target = model_to_scan_reflections_on.association(association_name.to_sym).target

      if target.is_a?(ActiveRecord::Base)
        inspect_model(target)
      else
        target&.each do |sub_model|
          inspect_model(sub_model)
        end
      end
    end
  end
end
