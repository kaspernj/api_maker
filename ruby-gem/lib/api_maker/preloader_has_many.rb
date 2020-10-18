class ApiMaker::PreloaderHasMany < ApiMaker::PreloaderBase
  def preload
    models.each do |model|
      preload_model(model)
    end

    models
  end

private

  def models
    @models ||= begin
      if use_joined_query?
        models_with_join
      else
        query = models_initial_query.select(reflection.active_record.arel_table[reflection.active_record.primary_key].as("api_maker_origin_id"))
        query = query.instance_eval(&reflection.scope) if reflection.scope
        query = query.accessible_by(ability) if ability
        query = ApiMaker::SelectColumnsOnCollection.execute!(
          collection: query,
          model_class: reflection.klass,
          select_columns: select_columns,
          table_name: query.klass.table_name
        )
        query
      end
    end
  end

  def use_joined_query?
    reflection.is_a?(ActiveRecord::Reflection::ThroughReflection) || reflection.options[:as].present?
  end

  def models_initial_query
    query = reflection.klass.where(reflection.foreign_key => collection.map(&primary_key_column))
    query.joins(reflection.inverse_of.name)
  end

  def preload_model(model)
    origin_data = find_origin_data_for_model(model)
    model_id = ApiMaker::PrimaryIdForModel.get(model)

    origin_data.fetch(:r)[reflection.name] ||= []
    origin_data.fetch(:r).fetch(reflection.name) << model_id

    serializer = ApiMaker::Serializer.new(ability: ability, args: args, locals: locals, model: model, select: select&.dig(model.class))
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
