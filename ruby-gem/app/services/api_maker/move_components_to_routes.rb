class ApiMaker::MoveComponentsToRoutes < ApiMaker::ApplicationService
  attr_reader :prepend_path, :routes_path

  def initialize(prepend_path:, routes_path:)
    @prepend_path = prepend_path
    @routes_path = routes_path
  end

  def perform
    routes.each do |route|
      path = "#{prepend_path}#{route.fetch("component")}"
      full_path = "app/javascript/components/#{path}"
      new_path = "app/javascript/routes/#{path}"

      full_path_with_jsx = "#{full_path}.jsx"
      new_path_with_jsx = "#{new_path}.jsx"

      if !File.exist?(full_path_with_jsx) && File.exist?("#{full_path}/index.jsx")
        full_path_with_jsx = "#{full_path}/index.jsx"
        new_path_with_jsx = "#{new_path}/index.jsx"
      end

      if File.exist?(full_path_with_jsx)
        new_dir = File.dirname(new_path_with_jsx)
        FileUtils.mkdir_p(new_dir)
        File.rename(full_path_with_jsx, new_path_with_jsx)
      end

      old_dir = File.dirname(full_path_with_jsx)

      Dir.unlink(old_dir) if File.exist?(old_dir) && dir_empty?(old_dir)
    end

    succeed!
  end

  def routes
    @routes = JSON.parse(File.read(routes_path)).fetch("routes")
  end

  def dir_empty?(path)
    Dir.foreach(path) do |file|
      next if file == "." || file == ".."

      return false
    end

    true
  end
end
