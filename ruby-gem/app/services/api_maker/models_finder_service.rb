class ApiMaker::ModelsFinderService < ApiMaker::ApplicationService
  attr_reader :resources_found

  def initialize
    @resources_found = {}
  end

  def perform
    find_resources_from_files
    find_resources_from_constants

    ServicePattern::Response.new(result: resources_found.values.sort_by(&:name))
  end

private

  def find_resources_from_files
    files.each do |model_path|
      path_name_match = model_path.match(/app\/api_maker\/resources\/(.+)\.rb\Z/)

      raise "Could not match model path: #{model_path}" unless path_name_match

      path_name = path_name_match[1]

      next if path_name == "application_resource"
      next unless path_name.end_with?("_resource")

      resource_class_name = path_name.classify.to_sym
      resource_class = "Resources::#{resource_class_name}".constantize
      resources_found[resource_class_name] = resource_class
    end
  end

  def find_resources_from_constants
    ::Resources.constants.each do |resource_class_name|
      next if resources_found.include?(resource_class_name)
      next if resource_class_name == :ApplicationResource
      next unless resource_class_name.to_s.end_with?("Resource")

      resources_found[resource_class_name] = ::Resources.const_get(resource_class_name)
    end
  end

  def paths
    @paths ||= [Rails.root.to_s] + Gem::Specification.map(&:gem_dir)
  end

  def files
    @files ||= begin
      files = []
      paths.each do |path|
        # Try to require any 'resources'-file which might dynamically define resources
        begin
          resources_path = "#{path}/app/api_maker/resources"
          require resources_path
          Rails.logger.info "Custom resources file loaded: #{resources_path}"
        rescue LoadError
          # Ignore if not found
        end

        files += Dir.glob("#{path}/app/api_maker/resources/**/*_resource.rb")
      end
      files
    end
  end
end
