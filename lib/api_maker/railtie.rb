class ApiMaker::Railtie < Rails::Railtie
  initializer "watch routes.json for changes and reload Rails routes if changed" do |app|
    file_path = Rails.root.join("app", "javascript", "shared", "routes.json")

    reloader = app.config.file_watcher.new([file_path]) do
      app.reload_routes!
    end

    app.reloaders << reloader
    app.reloader.to_run do
      reloader.execute_if_updated
    end
  end
end
