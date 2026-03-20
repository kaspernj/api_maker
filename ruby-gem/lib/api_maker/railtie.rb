class ApiMaker::Railtie < Rails::Railtie
  initializer "api_maker.session_shadow_middleware" do |app|
    app.config.middleware.insert_after(ActionDispatch::Session::CookieStore, ApiMaker::SessionShadowMiddleware)
  end

  initializer "watch routes.json for changes and reload Rails routes if changed" do |_app|
    file_path = Rails.root.join("app/javascript/shared/routes.json")
    ApiMaker::RoutesFileReloader.execute!(file_paths: [file_path]) if File.exist?(file_path)
  end
end
