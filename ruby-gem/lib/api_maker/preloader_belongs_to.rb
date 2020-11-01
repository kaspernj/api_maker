class ApiMaker::PreloaderBelongsTo < ApiMaker::PreloaderBase
  def preload
    models.each do |model|
      model_id = ApiMaker::PrimaryIdForModel.get(model)

      records_for_model(model).each do |record|
        record.relationships[reflection_name] = model_id
      end

      serializer = ApiMaker::Serializer.new(ability: ability, args: args, locals: locals, model: model, select: select&.dig(model.class))
      collection_name = serializer.resource.collection_name

      data.fetch(:preloaded)[collection_name] ||= {}
      data.fetch(:preloaded).fetch(collection_name)[model_id] ||= serializer
    end

    models
  end

private

  # Collects all the parent foreign keys like "users.organization_id" when preloading organizations and removes the blank (if a user doesn't have an org.)
  def look_up_values
    @look_up_values ||= collection.map(&reflection.foreign_key.to_sym).reject(&:blank?)
  end

  def models
    @models ||= begin
      if look_up_values.empty?
        # There is nothing to preload
        []
      else
        query = reflection.klass.where(look_up_key => look_up_values)
        query = query.instance_eval(&reflection.scope) if reflection.scope
        query = query.accessible_by(ability) if ability
        query = ApiMaker::SelectColumnsOnCollection.execute!(
          collection: query,
          model_class: reflection.klass,
          select_columns: select_columns,
          table_name: query.klass.table_name
        )

        query.load
        query
      end
    end
  end

  def look_up_key
    @look_up_key ||= reflection.options[:primary_key] || reflection.klass.primary_key
  end

  def records_for_model(model)
    # Force to string if one column is an integer and another is a string
    records
      .fetch(collection_name)
      .values
      .select { |record| record.model[reflection.foreign_key].to_s == model[look_up_key].to_s }
  end
end
