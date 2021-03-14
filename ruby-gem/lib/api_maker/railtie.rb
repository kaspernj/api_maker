class ApiMaker::Railtie < Rails::Railtie
  initializer "watch routes.json for changes and reload Rails routes if changed" do |_app|
    file_path = Rails.root.join("app/javascript/shared/routes.json")
    ApiMaker::RoutesFileReloader.execute!(file_paths: [file_path]) if File.exists?(file_path)
  end
end
