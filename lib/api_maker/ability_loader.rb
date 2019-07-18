class ApiMaker::AbilityLoader
  def initialize(ability:, args:)
    @ability = ability
    @args = args
    @loaded_resources = {}
  end

  def load_model_class(model_class)
    resource = ApiMaker::MemoryStorage.current.resource_for_model(model_class)
    load_resource(resource)
  end

  def load_resource(resource)
    return if @loaded_resources.key?(resource)

    resource.new(ability: @ability, args: @args, model: nil).abilities
    @loaded_resources[resource] = true
  end
end
