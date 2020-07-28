class ApiMaker::AbilitiesLoader < ApiMaker::ApplicationService
  attr_reader :abilities, :abilities_data, :abilities_with_no_conditions, :abilities_with_no_rules, :ability, :groupings, :serializers

  def initialize(abilities:, ability:, serializers:)
    @ability = ability
    @abilities = abilities.map(&:to_sym)
    @abilities_data = {}
    @abilities_with_no_conditions = []
    @abilities_with_no_rules = []
    @groupings = {}
    @serializers = serializers
  end

  def execute
    scan_abilities
    scan_groupings

    load_abilities_with_no_conditions if abilities_with_no_conditions.any?
    load_abilities_with_no_rules if abilities_with_no_rules.any?

    groupings.each_value do |ability_names|
      load_abilities_with_conditions(ability_names)
    end

    succeed!
  end

  def scan_abilities
    abilities.each do |ability_name|
      abilities_data[ability_name] = {
        combined_conditions: [],
        rules_count: 0,
        rule_with_no_conditions: false
      }

      ability.__send__(:rules).each do |can_can_rule|
        next if can_can_rule.subjects.exclude?(model_class)
        next if can_can_rule.actions.exclude?(ability_name)

        abilities_data[ability_name][:combined_conditions] << can_can_rule.conditions.to_s
        abilities_data[ability_name][:rules_count] += 1

        if can_can_rule.__send__(:conditions_empty?)
          abilities_data[ability_name][:rule_with_no_conditions] = true
          abilities_with_no_conditions << ability_name
        end
      end
    end
  end

  def scan_groupings
    abilities_data.each do |ability_name, ability_data|
      # No reason to create a group with no conditions - we are giving access to these without doing a query elsewhere
      next if ability_data.fetch(:rule_with_no_conditions)

      # If no rules have been defined, then we can safely assume no access without doing a query elsewhere
      if ability_data.fetch(:rules_count).zero?
        abilities_with_no_rules << ability_name
      else
        identifier = ability_data[:combined_conditions].join("___")

        groupings[identifier] ||= []
        groupings[identifier] << ability_name
      end
    end

    groupings
  end

  def load_abilities_with_no_conditions
    Rails.logger.debug "API maker: Loading abilities with no condition: [#{abilities_with_no_conditions.join(", ")}], #{model_class}"
    abilities_with_no_conditions.each do |ability_name|
      serializers.each do |serializer|
        serializer.load_ability(ability_name, true)
      end
    end
  end

  def load_abilities_with_no_rules
    Rails.logger.debug "API maker: Loading abilities with no rules: [#{abilities_with_no_rules.join(", ")}], #{model_class}"
    abilities_with_no_rules.each do |ability_name|
      serializers.each do |serializer|
        serializer.load_ability(ability_name, false)
      end
    end
  end

  def load_abilities_with_conditions(ability_names)
    Rails.logger.debug "API maker: Loading abilities with conditions through query: [#{ability_names.join(", ")}], #{model_class}"

    model_ids = model_class
      .accessible_by(ability, ability_names.first)
      .where(id: serializers.map(&:id))
      .pluck(model_class.primary_key)

    serializers.each do |serializer|
      ability_names.each do |ability_name|
        serializer.load_ability(ability_name, model_ids.include?(serializer.id))
      end
    end
  end

  def model_class
    @model_class ||= serializers.first.model.class
  end
end
