class ApiMaker::PreloaderHasMany < ApiMaker::PreloaderBase
  def preload
    models.each do |model|
      preload_model(model)
    end

    models
  end

private

  def models
    @models ||= if use_joined_query?
      models_with_join
    else
      primary_key_arel_column = reflection.active_record.arel_table[reflection.active_record.primary_key]

      query = models_initial_query.select(primary_key_arel_column.as("api_maker_origin_id"))
      query = query.instance_eval(&reflection.scope) if reflection.scope
      query = query.accessible_by(ability) if ability
      query = ApiMaker::SelectColumnsOnCollection.execute!(
        collection: query,
        model_class: reflection.klass,
        select_attributes: select,
        select_columns:,
        table_name: query.klass.table_name
      )
      query
    end
  end

  def use_joined_query?
    reflection.is_a?(ActiveRecord::Reflection::ThroughReflection) || reflection.options[:as].present?
  end

  def models_initial_query
    raise "#{reflection.active_record.name}.#{reflection.name} didn't have an `inverse_of` instruction" unless reflection.inverse_of

    query = reflection.klass.where(reflection.foreign_key => collection.map(&primary_key_column))
    query.joins(reflection.inverse_of.name)
  end

  def preload_model(model)
    origin_data = find_origin_data_for_model(model)
    model_id = ApiMaker::PrimaryIdForModel.get(model)

    reflection_data = origin_data.fetch(:r)[reflection.name] ||= []
    reflection_data << model_id unless reflection_data.include?(model_id)

    serializer = ApiMaker::Serializer.new(ability:, api_maker_args:, locals:, model:, select: select&.dig(model.class))
    underscore_name = serializer.resource.underscore_name

    data.fetch(:preloaded)[underscore_name] ||= {}
    data.fetch(:preloaded).fetch(underscore_name)[model_id] ||= serializer
  end

  def primary_key_column
    @primary_key_column ||= if reflection.options[:primary_key]
      reflection.options[:primary_key]&.to_sym
    elsif collection.is_a?(Array)
      collection.first.class.primary_key.to_sym
    else
      collection.primary_key.to_sym
    end
  end

  def find_origin_data_for_model(model)
    origin_id = model[:api_maker_origin_id]
    origin_data = records.fetch(underscore_name).fetch(origin_id)

    raise "Couldn't find any origin data by that type (#{underscore_name}) and ID (#{origin_id})" unless origin_data

    origin_data
  end
end
