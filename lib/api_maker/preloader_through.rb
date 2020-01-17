class ApiMaker::PreloaderThrough
  def initialize(collection:, reflection:)
    @collection = collection
    @reflection = reflection
  end

  def models_query_through_reflection
    last_reflection = @reflection.through_reflection.inverse_of

    if last_reflection
      table_name = last_reflection.table_name
      primary_key = last_reflection.klass.primary_key
    else
      table_name = @reflection.through_reflection.active_record.model_name.plural
      primary_key = @reflection.through_reflection.active_record.primary_key
    end

    joins_hash = joins_array_to_hash(joins_for_reflection(@reflection))

    @reflection.klass.joins(joins_hash)
      .where(table_name => {primary_key => @collection.map(&:id)})
  end

  def debug_reflection(reflection)
    puts "Reflection: #{reflection.name}"
    puts "Klass: #{reflection.klass}"
    puts "ActiveRecord: #{reflection.active_record}"
    puts
  end

  def joins_for_reflection(current_reflection)
    joins = []

    loop do
      debug_reflection(current_reflection)

      # Resolve if the through relationship is through multiple other through relationships
      current_reflection = resolve_through(current_reflection)

      debug_reflection(current_reflection)

      macro = current_reflection.through_reflection.macro
      inverse_name = current_reflection.through_reflection.__send__(:inverse_name)

      if inverse_name
        joins << inverse_name
      elsif macro == :has_many
        joins << current_reflection.through_reflection.name
      elsif macro == :belongs_to || macro == :has_one
        joins << current_reflection.through_reflection.active_record.model_name.plural.to_sym
      else
        raise "Unknown class: #{current_reflection.through_reflection.class.name}"
      end

      current_reflection = next_reflection_for(current_reflection)
      debug_reflection(current_reflection)
      puts "Joins: #{joins.reverse.join(", ")}"

      unless current_reflection.is_a?(ActiveRecord::Reflection::ThroughReflection)
        joins.append(append_name_for_current_reflection(current_reflection))
        break
      end
    end

    joins
  end

  def append_name_for_current_reflection(current_reflection)
    singular_name = current_reflection.__send__(:inverse_name)&.to_s || current_reflection.active_record.model_name.param_key
    return singular_name.to_sym if @reflection.klass.reflections.key?(singular_name)

    plural_name = singular_name.pluralize
    return plural_name.to_sym if @reflection.klass.reflections.key?(plural_name)

    raise "Couldn't find a reflection name #{singular_name} or #{plural_name} on #{@reflection.klass.name}"
  end

  def joins_array_to_hash(array)
    array = array.clone

    result = {}
    work_result = result

    while array.any?
      element = array.pop

      if array.length == 1
        work_result[element] = array.pop
      else
        work_result[element] = {}
      end

      work_result = work_result[element]
    end

    result
  end

  def next_reflection_for(current_reflection)
    reflection_name = (current_reflection.source_reflection_name || @reflection.name).to_s

    new_reflection = current_reflection.through_reflection.klass.reflections[reflection_name.pluralize]
    new_reflection ||= current_reflection.through_reflection.klass.reflections[reflection_name.singularize]

    raise "No such reflection: #{current_reflection.through_reflection.klass.name}##{reflection_name}" unless new_reflection

    new_reflection
  end

  def resolve_through(current_reflection)
    current_reflection = current_reflection.through_reflection while current_reflection.through_reflection.is_a?(ActiveRecord::Reflection::ThroughReflection)
    current_reflection
  end
end
