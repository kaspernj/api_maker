class ApiMaker::AbilityLoader
  def initialize(ability:, args:)
    @ability = ability
    @args = args
    @loaded_resources = {}
  end

  def load_resource(resource)
    return if @loaded_resources.key?(resource)

    resource.new(ability: @ability, args: @args, model: nil).abilities
    @loaded_resources[resource] = true
  end
end
