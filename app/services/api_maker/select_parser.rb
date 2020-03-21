class ApiMaker::SelectParser < ApiMaker::ApplicationService
  attr_reader :select

  def initialize(select:)
    @select = select
  end

  def execute
    new_select = {}

    select.each do |model_collection_name, attributes|
      model_class = model_collection_name.underscore.singularize.camelize
      resource = "Resources::#{model_class}Resource".safe_constantize
      raise "Resource not found for: #{model_collection_name}" unless resource

      new_attributes = resource._attributes.select { |key| attributes.include?(key.to_s) }
      new_select[resource.model_class] = new_attributes
    end

    succeed! new_select
  end
end
