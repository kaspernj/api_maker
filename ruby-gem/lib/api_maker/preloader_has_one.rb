class ApiMaker::PreloaderHasOne < ApiMaker::PreloaderBase
  def preload
    models.each do |model|
      model_id = ApiMaker::PrimaryIdForModel.get(model)

      ApiMaker::Configuration.profile(-> { "Preloading #{model.class.name}##{model_id}" }) do
        origin_data = origin_data_for_model(model)
        origin_data.fetch(:r)[reflection.name] = model_id

        serializer = ApiMaker::Serializer.new(ability:, api_maker_args:, locals:, model:, select: select&.dig(model.class))
        underscore_name = serializer.resource.underscore_name

        data.fetch(:preloaded)[underscore_name] ||= {}
        data.fetch(:preloaded).fetch(underscore_name)[model_id] ||= serializer
      end
    end

    models
  end

  def models
    @models ||= if reflection.is_a?(ActiveRecord::Reflection::ThroughReflection)
      models_with_join
    else
      query = query_normal
      query = query.instance_eval(&reflection.scope) if reflection.scope
      query = query.accessible_by(ability) if ability
      query = ApiMaker::SelectColumnsOnCollection.execute!(
        collection: query,
        model_class: reflection.klass,
        select_attributes: select,
        select_columns:,
        table_name: query.klass.table_name
      )
      query = query.fix if ApiMaker::DatabaseType.postgres?
      query.load
      query
    end
  end

  def origin_data_for_model(model)
    origin_id = model[:api_maker_origin_id]
    data.dig!(:preloaded, underscore_name, origin_id)
  end

  def look_up_values
    @look_up_values ||= if collection.loaded?
      collection.map(&:id).uniq
    else
      collection.group(:id).pluck(:id)
    end
  end

  def query_normal
    query = reflection.klass.where(reflection.foreign_key => look_up_values)
      .select(reflection.klass.arel_table[reflection.foreign_key].as("api_maker_origin_id"))

    query = query.where("#{reflection.options.fetch(:as)}_type" => reflection_active_record.name) if reflection.options[:as]
    query
  end
end
