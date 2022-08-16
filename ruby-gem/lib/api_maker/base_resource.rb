class ApiMaker::BaseResource
  ApiMaker::IncludeHelpers.execute!(klass: self)

  attr_reader :ability, :api_maker_args, :locals, :model

  delegate :can, :can?, allow_nil: true, to: :ability

  CRUD = [:create, :create_events, :read, :update, :update_events, :destroy, :destroy_events].freeze
  READ = [:create_events, :destroy_events, :read, :update_events].freeze
  WRITE = [:create, :update, :destroy].freeze

  def self.attribute(attribute_name, **args)
    # Automatically add a columns argument if the attribute name matches a column name on the models table
    args[:requires_columns] = [attribute_name] if !args.key?(:requires_columns) && column_exists_on_model?(model_class, attribute_name)

    ApiMaker::MemoryStorage.current.add(self, :attributes, attribute_name, args)
  end

  def self.attributes(*attributes, **args)
    attributes.each do |attribute_name|
      attribute(attribute_name, **args)
    end
  end

  def self._attributes
    ApiMaker::MemoryStorage.current.storage_for(self, :attributes)
  end

  def self._attributes_with_string_keys
    @_attributes_with_string_keys ||= begin
      result = {}
      _attributes.each do |key, value|
        result[key.to_s] = value
      end
      result
    end
  end

  def self.collection_commands(*list)
    list.each do |collection_command|
      ApiMaker::MemoryStorage.current.add(self, :collection_commands, collection_command)
    end
  end

  def self.column_exists_on_model?(model_class, column_name)
    model_class.column_names.include?(column_name.to_s)
  rescue ActiveRecord::StatementInvalid
    # This happens if the table or column doesn't exist - like if we are running during a migration
    false
  end

  def self.member_commands(*list)
    list.each do |member_command|
      ApiMaker::MemoryStorage.current.add(self, :member_commands, member_command)
    end
  end

  def self.model_class=(klass)
    # Set the name to avoid reloading issues with Rails
    @model_class_name ||= klass.name
    ApiMaker::MemoryStorage.current.model_class_for(resource: self, klass: klass)
  end

  def self.model_class
    # Use the name to constantize to avoid reloading issues with Rails
    model_class_name.constantize
  end

  def self.model_class_name=(new_model_class_name) # rubocop:disable Style/TrivialAccessors
    @model_class_name = new_model_class_name
  end

  def self.model_class_name
    @model_class_name ||= short_name
  end

  def self.relationships(*relationships)
    relationships.each do |relationship|
      ApiMaker::MemoryStorage.current.add(self, :relationships, relationship)
    end
  end

  def self._relationships
    ApiMaker::MemoryStorage.current.storage_for(self, :relationships)
  end

  def self.collection_name
    @collection_name ||= plural_name.underscore
  end

  def self.default_select
    _attributes.select do |_attribute_name, args|
      !args.fetch(:args).key?(:selected_by_default) || args.fetch(:args).fetch(:selected_by_default)
    end
  end

  def self.plural_name
    @plural_name ||= short_name.pluralize
  end

  def self.require_name
    @require_name ||= collection_name.singularize
  end

  def self.short_name
    @short_name ||= begin
      match = name.match(/\AResources::(.+)Resource\Z/)
      raise "Couldn't match resource name. Does it end with 'Resource' and start with 'Resources::'? Name was: #{name}" unless match

      match[1]
    end
  end

  def self.underscore_name
    @underscore_name ||= plural_name.underscore
  end

  def initialize(ability: nil, api_maker_args: {}, locals:, model:)
    @ability = ability
    @api_maker_args = api_maker_args
    @locals = locals || api_maker_args&.dig(:locals) || {}
    @model = model
  end

  def can_access_through(ability:, relationship:)
    reflection = model_class.reflections.fetch(relationship.to_s)
    target_model_class = reflection.klass
    self.ability.load_abilities(target_model_class)
    relevant_rules = self.ability.__send__(:relevant_rules, ability, target_model_class)

    relevant_rules.each do |relevant_rule|
      if relevant_rule.conditions.empty?
        handle_empty_conditions(
          model_class: model_class,
          reflection: reflection,
          relationship: relationship,
          target_model_class: target_model_class
        )
      elsif relevant_rule.conditions.is_a?(Array)
        handle_array_condition_rule(
          ability: ability,
          model_class: model_class,
          reflection: reflection,
          relevant_rule: relevant_rule
        )
      else
        can ability, model_class, {
          reflection.name => relevant_rule.conditions
        }
      end
    end
  end

  def can_access_through_accessible_model(abilities, relationship_name, sub_query = nil, additional_sql: nil) # rubocop:disable Metrics/AbcSize
    reflection = model_class.reflections[relationship_name.to_s]

    raise "No reflection named '#{relationship_name}' in #{model_class.reflections.keys}" unless reflection
    raise "You need to pass a third argument for a sub query on a polymorphic relationship" if reflection.options[:polymorphic] && !sub_query

    sub_query ||= reflection.klass

    query = sub_query
      .accessible_by(ability)
      .except(:select)
      .except(:group)
      .except(:limit)
      .except(:order)
      .select("1")
      .limit(1)

    case reflection.macro
    when :belongs_to
      exists_query = query.where("#{query.klass.table_name}.#{query.klass.primary_key} = #{model_class.table_name}.#{reflection.foreign_key}")
    when :has_many, :has_one
      exists_query = query.where("#{query.klass.table_name}.#{reflection.foreign_key} = #{model_class.table_name}.#{model_class.primary_key}")
    else
      raise "Unhandled macro: #{reflection.macro}"
    end

    if reflection.options[:polymorphic]
      exists_query = exists_query.where(
        model_class.table_name => {
          reflection.foreign_type => query.klass.name
        }
      )
    end

    exists_sql = "EXISTS (#{exists_query.to_sql})"
    exists_sql << additional_sql if additional_sql

    can abilities, model_class, [exists_sql] do |model|
      if !reflection.options[:polymorphic] || model.__send__(reflection.foreign_type) == query.klass.name
        model.class.where(id: model.id).where(exists_sql).exists?
      end
    end
  end

  def inspect
    "#<#{self.class.name}:#{__id__}>"
  end

  def model_class
    self.class.model_class
  end

private

  def handle_empty_conditions(model_class:, reflection:, relationship:, target_model_class:)
    lookup_query = target_model_class
      .where("#{target_model_class.table_name}.#{reflection.foreign_key} = #{model_class.table_name}.#{model_class.primary_key}")

    exists_sql = "EXISTS (#{lookup_query.to_sql})"

    can ability, model_class, [exists_sql] do |model|
      model.__send__(relationship).any?
    end
  end

  def handle_array_condition_rule(ability:, model_class:, reflection:, relevant_rule:)
    if raw_supported_macro?(reflection.macro)
      nested_sql = nested_raw_sql(
        model_class: model_class,
        relevant_rule: relevant_rule,
        reflection: reflection
      )

      can ability, model_class, [nested_sql] do |model|
        model_class.where(nested_sql).exists?(id: model.id)
      end
    else
      raise "No support for macro: #{reflection.macro}"
    end
  end

  def raw_supported_macro?(macro)
    macro == :belongs_to || macro == :has_many || macro == :has_one
  end

  def nested_raw_sql(model_class:, reflection:, relevant_rule:)
    # The conditions are given as raw SQL so we nest the original sub-query under a new one that filters on the ID of the current table as well
    relationship_sql = relevant_rule.conditions.first
    "EXISTS (" \
      "SELECT 1 " \
      "FROM #{reflection.klass.table_name} " \
      "WHERE " \
      "#{nested_raw_sql_condition(model_class: model_class, reflection: reflection)} AND " \
      "(#{relationship_sql})" \
      ")"
  end

  def nested_raw_sql_condition(model_class:, reflection:)
    if reflection.macro == :belongs_to
      "#{reflection.klass.table_name}.#{reflection.join_primary_key} = #{model_class.table_name}.#{reflection.foreign_key}"
    else
      "#{reflection.klass.table_name}.#{reflection.foreign_key} = #{model_class.table_name}.#{model_class.primary_key}"
    end
  end
end
