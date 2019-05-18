class ApiMaker::Preloader
  def initialize(ability: nil, args: nil, collection:, data:, include_param:, records:, select:)
    @ability = ability
    @args = args
    @collection = collection
    @data = data
    @include_param = include_param
    @records = records
    @select = select
  end

  def fill_data
    parsed = ApiMaker::RelationshipIncluder.parse(@include_param)
    return unless parsed

    parsed.each do |key, value|
      next unless key

      reflection = @collection.model.reflections[key]
      raise "Unknown reflection: #{@collection.model.name}##{key}" unless reflection

      fill_empty_relationships_for_key(reflection, key)
      preload_class = preload_class_for_key(reflection)

      preload_result = ApiMaker::Configuration.profile("Preloading #{reflection.klass.name} with #{preload_class.name}") do
        preload_class.new(
          ability: @ability,
          args: @args,
          collection: @collection,
          data: @data,
          records: @records,
          reflection: reflection,
          select: @select
        ).preload
      end

      next if value.blank? || preload_result.fetch(:collection).empty?

      ApiMaker::Preloader.new(
        ability: @ability,
        args: @args,
        data: @data,
        collection: preload_result.fetch(:collection),
        include_param: value,
        records: @data.fetch(:included),
        select: @select
      ).fill_data
    end
  end

private

  def fill_empty_relationships_for_key(reflection, key)
    if @records.is_a?(Hash)
      collection_name = ApiMaker::MemoryStorage.current.resource_for_model(reflection.active_record).collection_name
      records_to_set = @records.fetch(collection_name).values
    else
      records_to_set = @records.select { |record| record.model.class == reflection.active_record }
    end

    case reflection.macro
    when :has_many
      records_to_set.each do |model|
        model.relationships[key.to_sym] ||= []
      end
    when :belongs_to
      records_to_set.each do |model|
        model.relationships[key.to_sym] ||= nil
      end
    when :has_one
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
