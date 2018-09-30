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

      collection_methods = storage.collection_methods.select { |data| data.fetch(:klass) == klass }
      member_methods = storage.member_methods.select { |data| data.fetch(:klass) == klass }

      @routes.resources(klass.model_class.model_name.plural) do
        @routes.post :validate, on: :collection

        collection_methods.each do |collection_method_data|
          endpoint_name = collection_method_data.fetch(:collection_method)
          @routes.post(endpoint_name, on: :collection, controller: "commands", action: "create")
        end

        member_methods.each do |member_method_data|
          endpoint_name = member_method_data.fetch(:member_method)
          @routes.post(endpoint_name, on: :member, controller: "commands", action: "create")
        end
      end
    end
  end
end
