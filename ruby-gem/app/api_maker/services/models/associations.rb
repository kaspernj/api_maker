class Services::Models::Associations < ApiMaker::BaseService
  def perform
    resource_name = args.fetch(:resource_name)
    resource = "Resources::#{resource_name}Resource".safe_constantize
    model_class = resource.model_class
    associations = []
    model_class.reflections.each do |reflection_name, reflection|
      begin
        resource = ApiMaker::MemoryStorage.current.resource_for_model(reflection.klass)
      rescue ApiMaker::MemoryStorage::ResourceNotFoundError, ArgumentError => e
        # Ignore
      end

      associations << {
        human_name: model_class.human_attribute_name(reflection_name),
        reflection_name:,
        resource:
      }
    end

    succeed!(associations:)
  end
end
