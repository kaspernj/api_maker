class ApiMaker::Loader
  def self.load_everything
    resources_dir = Rails.root.join("app", "api_maker", "resources")
    files = Dir.glob("#{resources_dir}/**/*.rb")

    files.each do |file|
      require file
    end
  end
end
