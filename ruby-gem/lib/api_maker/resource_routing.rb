class ApiMaker::ResourceRouting
  def self.install_resource_routes(rails_routes, layout: "react", routes: nil)
    routes ||= JSON.parse(File.read(Rails.root.join("app/javascript/shared/routes.json")))
    routes.fetch("routes").each do |route|
      puts "Route: #{route} (layout: #{layout})"
      rails_routes.get route.fetch("path") => "#{layout}#show", as: route.fetch("name").to_sym
    end
  end
end
