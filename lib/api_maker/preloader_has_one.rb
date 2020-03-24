class ApiMaker::PreloaderHasOne < ApiMaker::PreloaderBase
  def preload
    models.each do |model|
      model_id = ApiMaker::PrimaryIdForModel.get(model)

      ApiMaker::Configuration.profile("Preloading #{model.class.name}##{model_id}") do
        origin_data = origin_data_for_model(model)
        origin_data.fetch(:r)[reflection.name] = model_id

        serializer = ApiMaker::Serializer.new(ability: ability, args: args, model: model, select: select&.dig(model.class))
        collection_name = serializer.resource.collection_name

        data.fetch(:preloaded)[collection_name] ||= {}
        data.fetch(:preloaded).fetch(collection_name)[model_id] ||= serializer
      end
    end

    models
  end

  def models
    @models ||= begin
      if reflection.is_a?(ActiveRecord::Reflection::ThroughReflection)
        models_with_join
      else
        query = query_normal
        query = query.instance_eval(&reflection.scope) if reflection.scope
        query = query.accessible_by(ability) if ability
        query = ApiMaker::SelectColumnsOnCollection.execute!(
          collection: query,
          model_class: reflection.klass,
          select_columns: select_columns,
          table_name: query.klass.table_name
        )
        query = query.fix
        query.load
        query
      end
    end
  end

  def origin_data_for_model(model)
    origin_id = model[:api_maker_origin_id]
    data.fetch(:preloaded).fetch(collection_name).fetch(origin_id)
  end

  def query_normal
    reflection.klass.where(reflection.foreign_key => collection.map(&:id))
      .select(reflection.klass.arel_table[reflection.foreign_key].as("api_maker_origin_id"))
  end
end
