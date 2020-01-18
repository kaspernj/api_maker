class ApiMaker::PreloaderBase
  def collection_ids
    @collection_ids ||= @collection.map do |collection_model|
      collection_model.read_attribute(@reflection.active_record.primary_key)
    end
  end

  def models
    @models ||= begin
      accessible_query = @reflection.klass.accessible_by(@ability)

      join_query = @reflection.active_record.joins(@reflection.name)

      # ActiveRecord might have joined the relationship by a predictable alias. If so we need to use that alias
      joined_name = "#{@reflection.name.to_s.pluralize}_#{@reflection.klass.name.underscore.pluralize}"

      if join_query.to_sql.include?(joined_name)
        join_query = join_query
          .select("#{joined_name}.*")
          .select(@reflection.active_record.arel_table[@reflection.active_record.primary_key].as("api_maker_origin_id"))
          .where(@reflection.active_record.primary_key => collection_ids)
          .where(joined_name => {@reflection.klass.primary_key => accessible_query})
      else
        join_query = join_query
          .select(@reflection.klass.arel_table[Arel.star])
          .select(@reflection.active_record.arel_table[@reflection.active_record.primary_key].as("api_maker_origin_id"))
          .where(@reflection.active_record.primary_key => collection_ids)
          .where(@reflection.klass.table_name => {@reflection.klass.primary_key => accessible_query})
      end

      @reflection.klass.find_by_sql(join_query.to_sql)
    end
  end
end
