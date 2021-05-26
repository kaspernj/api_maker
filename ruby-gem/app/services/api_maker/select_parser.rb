class ApiMaker::SelectParser < ApiMaker::ApplicationService
  attr_reader :select

  def initialize(select:)
    @select = select
  end

  def perform
    new_select = {}

    select.each do |model_collection_name, attributes|
      model_class = model_collection_name.underscore.singularize.camelize
      resource = "Resources::#{model_class}Resource".safe_constantize
      raise "Resource not found for: #{model_collection_name}" unless resource

      selects = {}
      new_select[resource.model_class] ||= selects
      resource_attributes = resource._attributes_with_string_keys

      attributes.each do |attribute|
        resource_attribute = resource_attributes[attribute]
        raise "Attribute not found on the #{resource.short_name} resource: #{attribute}" unless resource_attribute

        selects[attribute.to_sym] = resource_attribute
      end

      new_select[resource.model_class] = selects
    end

    succeed! new_select
  end
end
