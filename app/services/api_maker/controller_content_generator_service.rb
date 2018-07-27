class ApiMaker::ControllerContentGeneratorService < ApiMaker::ApplicationService
  def initialize(model:)
    @model = model
  end

  def execute!
    ServicePattern::Response.new(result: content)
  end

private

  def controller_name
    "ApiMaker::#{@model.name.underscore.pluralize.camelize}Controller"
  end

  def content
    template_path = File.join(__dir__, "..", "..", "..", "lib", "api_maker", "controllers", "template.rb.erb")

    erb = ERB.new(File.read(template_path))
    erb.result(binding)
  end
end
