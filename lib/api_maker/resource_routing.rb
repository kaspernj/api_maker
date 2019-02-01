class ApiMaker::ResourceRouting
  def self.install_resource_routes(rails_routes)
    routes = JSON.parse(File.read(Rails.root.join("app", "javascript", "shared", "routes.json")))
    routes.fetch("routes").each do |route|
      rails_routes.get route.fetch("path") => "react#show", as: route.fetch("name").to_sym
    end
  end
end
