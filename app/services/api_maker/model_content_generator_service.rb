class ApiMaker::ModelContentGeneratorService < ApiMaker::ApplicationService
  attr_reader :model

  def initialize(model:)
    @model = model
  end

  def execute!
    if serializer
      ServicePattern::Response.new(result: model_content)
    else
      ServicePattern::Response.new(errors: ["No serializer defined for #{model.name}"])
    end
  end

private

  def attributes
    serializer._attributes.map do |attribute_name|
      {name: attribute_name, type: model.columns_hash[attribute_name.to_s]&.type || :unknown}
    end
  end

  def model_content
    erb = ERB.new(File.read(model_template_path))
    erb.result(binding)
  end

  def model_template_path
    File.join(__dir__, "..", "..", "..", "lib", "api_maker", "javascript", "ModelTemplate.js.erb")
  end

  def reflections
    @reflections ||= proc do
      result = []
      serializer._reflections.each_key do |name|
        reflection = model.reflections.values.find { |reflection_i| reflection_i.name == name }
        next unless reflection
        result << reflection
      end

      result
    end.call
  end

  def reflections_for_model_class_data
    @reflections_for_model_class_data ||= reflections.map do |reflection|
      {
        className: reflection.class_name,
        name: reflection.name,
        macro: reflection.macro
      }
    end
  end

  def serializer
    @serializer ||= ActiveModel::Serializer.get_serializer_for(@model)
  end
end
