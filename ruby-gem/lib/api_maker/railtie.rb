class ApiMaker::Railtie < Rails::Railtie
  initializer "api_maker.session_shadow_middleware" do |app|
    session_middleware = self.class.session_middleware_class(app.config.session_store)

    app.config.middleware.insert_after(session_middleware, ApiMaker::SessionShadowMiddleware)
  rescue RuntimeError => e
    raise unless e.message.include?("No such middleware to insert after")
  end

  initializer "watch routes.json for changes and reload Rails routes if changed" do |_app|
    file_path = Rails.root.join("app/javascript/shared/routes.json")
    ApiMaker::RoutesFileReloader.execute!(file_paths: [file_path]) if File.exist?(file_path)
  end

  def self.session_middleware_class(session_store)
    return ActionDispatch::Session::CookieStore if session_store.nil?
    return session_store if session_store.name&.start_with?("ActionDispatch::Session::")

    nil
  end
end
