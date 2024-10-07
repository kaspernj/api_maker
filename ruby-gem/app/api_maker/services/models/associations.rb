class Services::Models::Associations < ApiMaker::BaseService
  def perform
    associations = []
    model_class.reflections.each do |reflection_name, reflection|
      next if reflection.polymorphic?

      begin
        reflection_resource = ApiMaker::MemoryStorage.current.resource_for_model(reflection.klass)
      rescue ApiMaker::MemoryStorage::ResourceNotFoundError, ArgumentError
        # Ignore
      end

      associations << {
        human_name: model_class.human_attribute_name(reflection_name),
        model_class_name: reflection.klass.name,
        reflection_name:,
        resource: reflection_resource
      }
    end

    succeed!(associations:, ransackable_attributes:, ransackable_scopes:)
  end

  def model_class
    @model_class ||= args.fetch(:model_class_name).safe_constantize
  end

  def ransackable_attributes
    @ransackable_attributes ||= model_class.ransackable_attributes(current_ability).sort.map do |attribute_name|
      {
        attribute_name:,
        human_name: model_class.human_attribute_name(attribute_name)
      }
    end
  end

  def ransackable_scopes
    @ransackable_scopes ||= model_class.ransackable_scopes(current_ability).sort
  end
end
