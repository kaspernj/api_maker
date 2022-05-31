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
      next unless model_path.start_with?(Rails.root.to_s)

      path_name = model_path.gsub(/\A#{Regexp.escape(Rails.root.to_s)}\/app\/api_maker\/resources\//, "").gsub(/\.rb\Z/, "")
      next if path_name == "application_resource"

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

  def files
    @files ||= Dir.glob(Rails.root.join("app/api_maker/resources/**/*_resource.rb"))
  end
end
