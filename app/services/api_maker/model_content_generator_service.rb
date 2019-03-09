class ApiMaker::ModelContentGeneratorService < ApiMaker::ApplicationService
  attr_reader :model

  def initialize(model:)
    @model = model
  end

  def execute!
    if resource
      ServicePattern::Response.new(result: model_content)
    else
      ServicePattern::Response.new(errors: ["No resource defined for #{model.name}"])
    end
  end

private

  def attributes
    resource._attributes.map do |attribute, _data|
      {name: attribute, type: model_type(attribute)}
    end
  end

  def collection_commands
    ApiMaker::Loader.load_everything
    ApiMaker::MemoryStorage.current.storage_for(resource, :collection_commands)
  end

  def member_commands
    ApiMaker::Loader.load_everything
    ApiMaker::MemoryStorage.current.storage_for(resource, :member_commands)
  end

  def model_content
    erb = ERB.new(File.read(model_template_path))
    erb.filename = File.realpath(model_template_path)
    erb.result(binding)
  end

  def model_template_path
    File.join(__dir__, "..", "..", "..", "lib", "api_maker", "javascript", "model-template.js.erb")
  end

  def model_type(attribute_name)
    model_type = model.columns_hash[attribute_name.to_s]&.type
    model_type = :money if monetized_attributes.include?(attribute_name.to_s)
    model_type ||= :unknown
    model_type
  end

  def monetized_attributes
    @monetized_attributes ||= @model.try(:monetized_attributes).try(:map) { |attribute| attribute[0] } || []
  end

  def reflections
    @reflections ||= resource._relationships.map do |name, _data|
      reflection = model.reflections.values.find { |reflection_i| reflection_i.name == name }
      raise "Couldnt find reflection by that name: #{name}" unless reflection
      reflection
    end
  end

  def reflection_has_many_parameters(reflection)
    parameters = {
      reflectionName: reflection.name,
      model: "{{this}}",
      modelName: reflection.class_name,
      modelClass: "{{modelClass}}",
      targetPathName: "/api_maker/#{reflection.klass.model_name.route_key}"
    }

    if reflection.options[:through]
      parameters[:params] = {
        through: {
          model: model.name,
          id: "{{id}}",
          reflection: reflection.name
        }
      }
    else
      parameters[:ransack] = {
        "#{reflection.foreign_key}_eq" => "{{id}}"
      }
    end

    parameters
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

  def resource
    @resource ||= ApiMaker::MemoryStorage.current.resource_for_model(@model)
  end
end
