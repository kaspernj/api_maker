class ApiMaker::PreloaderBelongsTo < ApiMaker::PreloaderBase
  def preload
    models.each do |model|
      model_id = ApiMaker::PrimaryIdForModel.get(model)

      records_for_model(model).each do |record|
        record.relationships[reflection_name] = model_id
      end

      serializer = ApiMaker::Serializer.new(ability:, api_maker_args:, locals:, model:, select: select&.dig(model.class))
      underscore_name = serializer.resource.underscore_name

      data.fetch(:preloaded)[underscore_name] ||= {}
      data.fetch(:preloaded).fetch(underscore_name)[model_id] ||= serializer
    end

    models
  end

private

  # Collects all the parent foreign keys like "users.organization_id" when preloading organizations and removes the blank (if a user doesn't have an org.)
  def look_up_values
    @look_up_values ||= if collection.is_a?(Array) || collection.loaded?
      collection.map(&reflection.foreign_key.to_sym).reject(&:blank?).uniq # rubocop:disable Rails/CompactBlank
    else
      collection.group(reflection.foreign_key.to_sym).pluck(reflection.foreign_key.to_sym)
    end
  end

  def models
    @models ||= if look_up_values.empty?
      # There is nothing to preload
      []
    else
      query = reflection.klass.where(look_up_key => look_up_values)
      query = query.instance_eval(&reflection.scope) if reflection.scope
      query = query.accessible_by(ability) if ability
      query = ApiMaker::SelectColumnsOnCollection.execute!(
        collection: query,
        model_class: reflection.klass,
        select_attributes: select,
        select_columns:,
        table_name: query.klass.table_name
      )

      query.load
      query
    end
  end

  def look_up_key
    @look_up_key ||= reflection.options[:primary_key] || reflection.klass.primary_key
  end

  def records_for_model(model)
    # Force to string if one column is an integer and another is a string
    records
      .fetch(underscore_name)
      .values
      .select { |record| record.model[reflection.foreign_key].to_s == model[look_up_key].to_s }
  end
end
