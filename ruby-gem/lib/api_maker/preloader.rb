class ApiMaker::Preloader
  attr_reader :api_maker_args, :key_path, :locals, :model_class, :preload_param

  def initialize(
    ability: nil,
    api_maker_args: nil,
    collection:,
    data:,
    key_path: [],
    locals:,
    preload_param:,
    model_class: nil,
    records:,
    select:,
    select_columns:
  )
    @ability = ability
    @api_maker_args = api_maker_args
    @collection = collection
    @data = data
    @key_path = key_path
    @locals = locals
    @preload_param = preload_param
    @model_class = model_class || @collection.model
    @records = records
    @select = select
    @select_columns = select_columns
  end

  def fill_data # rubocop:disable Metrics/AbcSize
    parsed = ApiMaker::RelationshipPreloader.parse(preload_param)
    return unless parsed

    parsed.each do |key, value|
      next unless key

      key_path << key

      reflection = model_class.reflections[key]
      raise "Unknown reflection: #{model_class}##{key}" unless reflection

      fill_empty_relationships_for_key(reflection, key)
      preload_class = preload_class_for_key(reflection)

      Rails.logger.debug { "API maker: Preloading #{model_class}: #{key_path.join(".")}" }

      preload_result = ApiMaker::Configuration.profile(-> { "Preloading #{reflection.klass.name} with #{preload_class.name}" }) do
        preload_class
          .new(
            ability: @ability,
            api_maker_args:,
            collection: @collection,
            data: @data,
            locals:,
            records: @records,
            reflection:,
            select: @select,
            select_columns: @select_columns
          )
          .preload
      end

      if value.blank? || preload_result.empty?
        key_path.pop
        next
      end

      ApiMaker::Preloader
        .new(
          ability: @ability,
          api_maker_args:,
          data: @data,
          collection: preload_result,
          key_path: key_path.dup,
          locals:,
          preload_param: value,
          model_class: reflection.klass,
          records: @data.fetch(:preloaded),
          select: @select,
          select_columns: @select_columns
        )
        .fill_data

      key_path.pop
    end
  end

private

  # Smoke test to make sure we aren't doing any additional and unnecessary queries
  def check_collection_loaded!
    raise "Collection wasn't loaded?" if @collection.is_a?(ActiveRecord::Relation) && !@collection.loaded?
  end

  def fill_empty_relationships_for_key(reflection, key)
    check_collection_loaded!
    collection_name = ApiMaker::MemoryStorage.current.resource_for_model(reflection.active_record).collection_name
    records_to_set = @collection.map { |model| @records.dig(collection_name, model.id) }

    case reflection.macro
    when :has_many
      records_to_set.each do |model|
        model.relationships[key.to_sym] ||= []
      end
    when :belongs_to, :has_one
      records_to_set.each do |model|
        model.relationships[key.to_sym] ||= nil
      end
    else
      raise "Unknown macro: #{reflection.macro}"
    end
  end

  def preload_class_for_key(reflection)
    case reflection.macro
    when :has_many
      ApiMaker::PreloaderHasMany
    when :belongs_to
      ApiMaker::PreloaderBelongsTo
    when :has_one
      ApiMaker::PreloaderHasOne
    else
      raise "Unknown macro: #{reflection.macro}"
    end
  end
end
