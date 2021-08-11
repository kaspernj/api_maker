class ApiMaker::ResourceRouting
  def self.install_resource_routes(rails_routes, layout: "react", route_definitions:)
    rails_routes.instance_variable_set(:@api_maker_installed_routes, {}) unless rails_routes.instance_variable_get(:@api_maker_installed_routes)
    installed_routes = rails_routes.instance_variable_get(:@api_maker_installed_routes)

    route_definitions.fetch("routes").each do |route|
      route_name = route.fetch("name").to_sym
      route_as = route_name
      route_path = route.fetch("path")

      # No longer necessary? Fixed after around Rails 6.0.4?
      # if installed_routes.key?(route_name)
      #   route_duplicate_count = installed_routes.fetch(route_name)
      #   route_as = "#{route_as}_duplicate_#{route_duplicate_count}"
      # end

      rails_routes.get route_path => "#{layout}#show", as: route_as

      installed_routes[route_name] ||= 0
      installed_routes[route_name] += 1
    end
  end
end
