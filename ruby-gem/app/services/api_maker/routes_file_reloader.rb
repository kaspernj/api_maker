class ApiMaker::RoutesFileReloader < ApiMaker::ApplicationService
  attr_reader :file_paths

  def initialize(file_paths:)
    @file_paths = file_paths
  end

  def execute
    reloader = Rails.application.config.file_watcher.new(file_paths) do
      Rails.application.reload_routes!
    end

    Rails.application.reloaders << reloader
    Rails.application.reloader.to_run do
      reloader.execute_if_updated
    end

    succeed!
  end
end
