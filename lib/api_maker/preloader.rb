class ApiMaker::Preloader
  def initialize(ability: nil, collection:, data:, include_param:, records: nil)
    @ability = ability
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

      reflection = @collection.model.reflections.fetch(key)
      scope = reflection.klass

      if reflection.macro == :has_many
        preload_result = ApiMaker::PreloaderHasMany.new(ability: @ability, data: @data, records: @records, collection: @collection, reflection: reflection).preload
      elsif reflection.macro == :belongs_to
        preload_result = ApiMaker::PreloaderBelongsTo.new(ability: @ability, data: @data, records: @records, collection: @collection, reflection: reflection).preload
      elsif reflection.macro == :has_one
        preload_result = ApiMaker::PreloaderHasOne.new(ability: @ability, data: @data, records: @records, collection: @collection, reflection: reflection).preload
      else
        raise "Unknown macro: #{reflection.macro}"
      end

      if value.present?
        ApiMaker::Preloader.new(ability: @ability, data: @data, collection: preload_result.fetch(:collection), include_param: value, records: @data.fetch(:included)).fill_data
      end
    end
  end
end
