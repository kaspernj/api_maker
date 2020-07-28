class ApiMaker::AbilityLoader
  attr_reader :ability, :args, :loaded, :locals, :loaded_model_names

  def initialize(ability:, args:, locals:)
    @ability = ability
    @args = args
    @locals = locals
    @loaded_model_names = {}
  end

  def load_model_class(model_class)
    return if loaded_model_names.key?(model_class.name)

    resource = ApiMaker::MemoryStorage.current.resource_for_model(model_class)
    load_resource(resource)
  end

  def load_resource(resource)
    return if loaded_model_names.key?(resource.model_class_name)

    resource.new(ability: ability, args: args, locals: locals, model: nil).abilities
    loaded_model_names[resource.model_class_name] = true
  end
end
