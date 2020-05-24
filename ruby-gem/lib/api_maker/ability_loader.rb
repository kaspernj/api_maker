class ApiMaker::AbilityLoader
  def initialize(ability:, args:)
    @ability = ability
    @args = args
    @loaded_model_names = {}
  end

  def load_model_class(model_class)
    return if @loaded_model_names.key?(model_class.name)

    resource = ApiMaker::MemoryStorage.current.resource_for_model(model_class)
    load_resource(resource)
  end

  def load_resource(resource)
    return if @loaded_model_names.key?(resource.model_class_name)

    resource.new(ability: @ability, args: @args, model: nil).abilities
    @loaded_model_names[resource.model_class_name] = true
  end
end
