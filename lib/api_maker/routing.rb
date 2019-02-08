class ApiMaker::Routing
  def self.install(routes)
    routing = ApiMaker::Routing.new(routes: routes)
    routing.install
  end

  def initialize(routes:)
    ApiMaker::Loader.load_everything
    @routes = routes
  end

  def install
    storage = ApiMaker::MemoryStorage.current

    storage.resources.each do |resource|
      klass = resource.fetch(:klass)

      collection_commands = storage.storage_for(klass, :collection_commands)
      member_commands = storage.storage_for(klass, :member_commands)

      @routes.resources(klass.model_class.model_name.plural) do
        @routes.post :validate, on: :collection
      end
    end
  end
end
