class ApiMaker::Loader
  IGNORED_GEMS = ["actionmailbox", "activestorage", "actiontext"].freeze

  def self.load_api_helpers
    paths.each do |path|
      load_dir("#{path}/app/api_maker/api_helpers")
    end
  end

  def self.load_resources
    ApiMaker::ModelsFinderService.execute!
  end

  def self.load_models
    paths.each do |path|
      load_dir("#{path}/app/models")
    end
  end

  def self.load_dir(dir, constantize: false)
    @dirs_loaded ||= {}

    return if @dirs_loaded.key?(dir)
    return unless File.exist?(dir)

    @dirs_loaded[dir] = true

    files = Dir.glob("#{dir}/**/*.rb")
    files.each do |file|
      require file
    end
  end

  def self.gem_dirs
    gem_dirs = []

    Gem::Specification.each do |gem_spec|
      next if IGNORED_GEMS.include?(gem_spec.name)

      gem_dirs << gem_spec.gem_dir
    end

    gem_dirs
  end

  def self.paths
    [Rails.root.to_s] + gem_dirs
  end
end
