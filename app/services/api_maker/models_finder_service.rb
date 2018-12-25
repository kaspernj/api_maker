class ApiMaker::ModelsFinderService < ApiMaker::ApplicationService
  def execute!
    ServicePattern::Response.new(result: models)
  end

private

  def models
    result = []
    Dir.glob(Rails.root.join("app", "api_maker", "resources", "**", "*.rb")) do |model_path|
      next unless model_path.start_with?(Rails.root.to_s)
      path_name = model_path.gsub(/\A#{Regexp.escape(Rails.root.to_s)}\/app\/api_maker\/resources\//, "").gsub(/\.rb\Z/, "")
      next if path_name == "application_resource"

      resource_class = "Resources::#{path_name.classify}".constantize
      result << resource_class.model_class
    end

    result
  end
end
