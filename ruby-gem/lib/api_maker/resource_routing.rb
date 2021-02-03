class ApiMaker::ResourceRouting
  def self.install_resource_routes(rails_routes, layout: "react", route_definitions:)
    route_definitions.fetch("routes").each do |route|
      rails_routes.get route.fetch("path") => "#{layout}#show", as: route.fetch("name").to_sym
    end
  end
end
