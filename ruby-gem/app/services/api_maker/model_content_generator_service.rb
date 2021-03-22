class ApiMaker::ModelContentGeneratorService < ApiMaker::ApplicationService
  attr_reader :model

  def initialize(model:)
    @model = model
  end

  def execute
    if resource
      succeed! model_content
    else
      fail! "No resource defined for #{model.name}"
    end
  end

private

  def attributes
    resource._attributes.map do |attribute, _data|
      {name: attribute}
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

  def monetized_attributes
    @monetized_attributes ||= @model.try(:monetized_attributes).try(:map) { |attribute| attribute[0] } || []
  end

  def reflections
    @reflections ||= resource._relationships.map do |name, _data|
      reflection = model.reflections.values.find { |reflection_i| reflection_i.name == name }
      raise "Couldnt find reflection by that name: #{name} on the model: #{model.name}" unless reflection

      reflection
    end
  end

  def reflection_has_many_parameters(reflection)
    {
      reflectionName: reflection.name,
      model: "{{this}}",
      modelName: reflection.class_name,
      modelClass: "{{modelClass}}"
    }
  end

  def reflection_has_many_parameters_query(reflection)
    if reflection.options[:through]
      {
        params: {
          through: {
            model: model.name,
            id: "{{id}}",
            reflection: reflection.name
          }
        }
      }
    else
      ransack = {"#{reflection.foreign_key}_eq" => "{{id}}"}
      ransack["#{reflection.options[:as]}_type_eq"] = reflection.active_record.name if reflection.options[:as]
      {ransack: ransack}
    end
  end

  def reflections_for_model_class_data
    @reflections_for_model_class_data ||= reflections.map do |reflection|
      resource = ApiMaker::MemoryStorage.current.resource_for_model(reflection.klass)

      {
        className: reflection.class_name,
        collectionName: resource.collection_name,
        name: reflection.name,
        macro: reflection.macro,
        resource_name: resource.short_name
      }
    end
  end

  def resource
    @resource ||= ApiMaker::MemoryStorage.current.resource_for_model(@model)
  end
end
