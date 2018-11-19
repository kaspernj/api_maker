class ApiMaker::Preloader
  def initialize(ability: nil, args: nil, collection:, data:, include_param:, records: nil)
    @ability = ability
    @args = args
    @collection = collection
    @data = data
    @include_param = include_param
    @records = records || @data.fetch(:data)
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

      preload_result = preload_class.new(
        ability: @ability,
        args: @args,
        data: @data,
        records: @records,
        collection: @collection,
        reflection: reflection
      ).preload

      next if value.blank?

      ApiMaker::Preloader.new(
        ability: @ability,
        args: @args,
        data: @data,
        collection: preload_result.fetch(:collection),
        include_param: value,
        records: @data.fetch(:included)
      ).fill_data
    end
  end

private

  def fill_empty_relationships_for_key(reflection, key)
    case reflection.macro
    when :has_many
      @data.fetch(:data).each do |model|
        model.relationships[key] ||= {data: []}
      end
    when :belongs_to
      @data.fetch(:data).each do |model|
        model.relationships[key] ||= nil
      end
    when :has_one
      @data.fetch(:data).each do |model|
        model.relationships[key] ||= nil
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
