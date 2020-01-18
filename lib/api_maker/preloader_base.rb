class ApiMaker::PreloaderBase
  attr_reader :ability, :args, :collection, :data, :records, :reflection, :reflection_name, :select

  def initialize(ability:, args:, data:, collection:, records:, reflection:, select:)
    @ability = ability
    @args = args
    @data = data
    @collection = collection
    @reflection = reflection
    @reflection_name = @reflection.name
    @records = records
    @select = select
  end

  def collection_ids
    @collection_ids ||= collection.map do |collection_model|
      collection_model.read_attribute(reflection.active_record.primary_key)
    end
  end

  def collection_name
    @collection_name ||= ApiMaker::MemoryStorage.current.resource_for_model(reflection.active_record).collection_name
  end

  def models
    @models ||= reflection.klass.find_by_sql(join_query.to_sql)
  end

  def accessible_query
    reflection.klass.accessible_by(ability)
  end

  # ActiveRecord might have joined the relationship by a predictable alias. If so we need to use that alias
  def joined_name
    "#{reflection.name.to_s.pluralize}_#{reflection.klass.name.underscore.pluralize}"
  end

  def join_query
    if initial_join_query.to_sql.include?(joined_name)
      join_query_with_joined_name
    else
      join_query_with_normal_name
    end
  end

  def initial_join_query
    reflection.active_record.joins(reflection.name)
  end

  def join_query_with_joined_name
    initial_join_query
      .select("#{joined_name}.*")
      .select(reflection.active_record.arel_table[reflection.active_record.primary_key].as("api_maker_origin_id"))
      .where(reflection.active_record.primary_key => collection_ids)
      .where(joined_name => {reflection.klass.primary_key => accessible_query})
  end

  def join_query_with_normal_name
    initial_join_query
      .select(reflection.klass.arel_table[Arel.star])
      .select(reflection.active_record.arel_table[reflection.active_record.primary_key].as("api_maker_origin_id"))
      .where(reflection.active_record.primary_key => collection_ids)
      .where(reflection.klass.table_name => {reflection.klass.primary_key => accessible_query})
  end
end
