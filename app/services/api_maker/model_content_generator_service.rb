class ApiMaker::ModelContentGeneratorService < ApiMaker::ApplicationService
  attr_reader :model

  def initialize(model:)
    @model = model
  end

  def execute!
    ServicePattern::Response.new(result: model_content)
  end

private

  def attribute_names
    serializer = ActiveModel::Serializer.get_serializer_for(@model)
    serializer._attributes
  end

  def js_attribute_name(name)
    camelized = name.to_s.camelize
    "#{camelized[0..0].downcase}#{camelized[1..camelized.length]}"
  end

  def model_content
    erb = ERB.new(File.read(model_template_path))
    erb.result(binding)
  end

  def model_template_path
    File.join(__dir__, "..", "..", "..", "lib", "api_maker", "javascript", "ModelTemplate.js.erb")
  end
end
