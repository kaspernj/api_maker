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
    puts "Install routing"

    storage = ApiMaker::MemoryStorage.current

    storage.resources.each do |resource|
      puts "Adding resource in api maker routes: #{resource}"
      klass = resource.fetch(:klass)
      member_methods = storage.member_methods.select { |data| data.fetch(:klass) == klass }

      @routes.resources(klass.model_class.model_name.plural) do
        puts "Inside resources for: #{klass.model_class.model_name.plural}"
        puts "MemberMethods: #{member_methods}"

        member_methods.each do |member_method_data|
          puts "MemberMethod: #{member_method_data.fetch(:member_method)}"

          endpoint_name = member_method_data.fetch(:member_method)

          @routes.post(endpoint_name, on: :member)
        end
      end
    end
  end
end
