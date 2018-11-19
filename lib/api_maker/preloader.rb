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

      if reflection.macro == :has_many
        @data.fetch(:data).each do |model|
          model.relationships[key] ||= {data: []}
        end

        preload_class = ApiMaker::PreloaderHasMany
      elsif reflection.macro == :belongs_to
        @data.fetch(:data).each do |model|
          model.relationships[key] ||= nil
        end

        preload_class = ApiMaker::PreloaderBelongsTo
      elsif reflection.macro == :has_one
        @data.fetch(:data).each do |model|
          model.relationships[key] ||= nil
        end

        preload_class = ApiMaker::PreloaderHasOne
      else
        raise "Unknown macro: #{reflection.macro}"
      end

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
end
