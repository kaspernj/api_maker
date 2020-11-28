class ApiMaker::PreloaderBase
  attr_reader :ability, :args, :collection, :data, :locals, :records, :reflection, :reflection_name, :select, :select_columns

  def initialize(ability:, args:, data:, collection:, locals:, records:, reflection:, select:, select_columns:) # rubocop:disable Metrics/ParameterLists
    @ability = ability
    @args = args
    @data = data
    @collection = collection
    @locals = locals
    @reflection = reflection
    @reflection_name = @reflection.name
    @records = records
    @select = select
    @select_columns = select_columns
  end

  def collection_ids
    @collection_ids ||= collection.map do |collection_model|
      collection_model[reflection.active_record.primary_key]
    end
  end

  def collection_name
    @collection_name ||= ApiMaker::MemoryStorage.current.resource_for_model(reflection.active_record).collection_name
  end

  def models_with_join
    @models_with_join ||= reflection.klass.find_by_sql(join_query.to_sql)
  end

  # ActiveRecord might have joined the relationship by a predictable alias. If so we need to use that alias
  def joined_name
    "#{reflection.name.to_s.pluralize}_#{reflection.klass.name.underscore.pluralize}"
  end

  def join_query
    if initial_join_query.to_sql.include?(joined_name)
      collection = join_query_with_joined_name
      table_name = joined_name
    else
      collection = join_query_with_normal_name
    end

    ApiMaker::SelectColumnsOnCollection.execute!(
      collection: collection,
      model_class: reflection.klass,
      select_columns: @select_columns,
      table_name: table_name
    )
  end

  def initial_join_query
    reflection.active_record.joins(reflection.name)
  end

  def join_query_with_joined_name
    # Since the joined table is using a different name, we don't need to double join the original table with an alias like under 'join_query_with_normal_name'
    # The "WHERE id IN sub_query version looks like this: # .where(joined_name => {reflection.klass.primary_key => accessible_query})

    exists_query = accessible_query
      .select("1")
      .where("#{accessible_query.klass.table_name}.#{accessible_query.klass.primary_key} = #{joined_name}.#{reflection.klass.primary_key}")

    initial_join_query
      .select(reflection.active_record.arel_table[reflection.active_record.primary_key].as("api_maker_origin_id"))
      .where(reflection.active_record.primary_key => collection_ids)
      .where("EXISTS (#{exists_query.to_sql})")
  end

  # Join a copy of the original table to be able to access previous table (by a copy) in the accessible query
  # This is done to avoid "WHERE id IN sub_query" which is much slower than "WHERE EXISTS sub_query"
  # The "WHERE id IN sub_query" version looks this simple line: .where(reflection.klass.table_name => {reflection.klass.primary_key => accessible_query})
  def join_query_with_normal_name # rubocop:disable Metrics/AbcSize
    exists_query = accessible_query
      .select("1")
      .where("#{accessible_query.klass.table_name}.#{accessible_query.klass.primary_key} = accessible_table.#{reflection.klass.primary_key}")

    initial_join_query
      .select(reflection.active_record.arel_table[reflection.active_record.primary_key].as("api_maker_origin_id"))
      .joins("JOIN #{reflection.klass.table_name} AS accessible_table ON accessible_table.id = #{reflection.klass.table_name}.#{reflection.klass.primary_key}")
      .where(reflection.active_record.primary_key => collection_ids)
      .where("EXISTS (#{exists_query.to_sql})")
  end

  def accessible_query
    reflection.klass.accessible_by(ability)
  end
end
