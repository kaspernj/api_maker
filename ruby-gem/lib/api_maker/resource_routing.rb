class ApiMaker::ResourceRouting
  def self.install_resource_routes(rails_routes, layout: "react", route_definitions:)
    rails_routes.instance_variable_set(:@api_maker_installed_routes, {}) unless rails_routes.instance_variable_get(:@api_maker_installed_routes)
    installed_routes = rails_routes.instance_variable_get(:@api_maker_installed_routes)

    route_definitions.fetch("routes").each do |route|
      route_name = route.fetch("name").to_sym
      route_path = route.fetch("path")

      unless installed_routes.key?(route_name)
        rails_routes.get route_path => "#{layout}#show", as: route_name
        installed_routes[route_name] = true
      end
    end
  end
end
