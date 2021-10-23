class ApiMaker::Loader
  def self.load_resources
    load_dir(Rails.root.join("app/api_maker/resources"))
  end

  def self.load_models
    load_dir(Rails.root.join("app/models"))
  end

  def self.load_dir(dir)
    @dirs_loaded ||= {}

    return if @dirs_loaded.key?(dir)

    @dirs_loaded[dir] = true

    files = Dir.glob("#{dir}/**/*.rb")
    files.each do |file|
      require file
    end
  end
end
