class Services::Models::Associations < ApiMaker::BaseService
  def perform
    resource_name = args.fetch(:resource_name)
    resource = "Resources::#{resource_name}Resource".safe_constantize
    model_class = resource.model_class
    associations = []
    model_class.reflections.each_key do |reflection_name|
      associations << reflection_name
    end

    succeed!(associations:)
  end
end
