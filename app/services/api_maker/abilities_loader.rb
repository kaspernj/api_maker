class ApiMaker::AbilitiesLoader < ApiMaker::ApplicationService
  attr_reader :abilities, :ability, :serializers

  def initialize(abilities:, ability:, serializers:)
    @ability = ability
    @abilities = abilities
    @serializers = serializers
  end

  def execute
    abilities.each do |ability_name|
      load_ability(ability_name)
    end

    succeed!
  end

  def load_ability(ability_name)
    model_ids = model_class
      .accessible_by(ability)
      .where(id: serializers.map(&:id))
      .pluck(model_class.primary_key)

    serializers.each do |serializer|
      serializer.load_ability(ability_name, model_ids.include?(serializer.id))
    end
  end

  def model_class
    @model_class ||= serializers.first.model.class
  end
end
