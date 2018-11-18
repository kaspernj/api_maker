class ApiMaker::Preloader
  def initialize(ability: nil, collection:, data:, include_param:)
    @ability = ability
    @collection = collection
    @data = data
    @include_param = include_param
  end

  def fill_data
    return result unless @include_param

    parsed = ApiMaker::RelationshipIncluder.parse(@include_param)
    parsed.each do |key, value|
      puts "Key: #{key}"
      puts "Value: #{value}"

      next unless key

      reflection = @collection.model.reflections.fetch(key)
      scope = reflection.klass

      if reflection.macro == :has_many
        ApiMaker::PreloaderHasMany.new(ability: @ability, base_data: @data, data: @data, reflection: reflection).preload
      elsif reflection.macro == :belongs_to
        ApiMaker::PreloaderBelongsTo.new(ability: @ability, base_data: @data, data: @data, reflection: reflection).preload
      elsif reflection.macro == :has_one
        ApiMaker::PreloaderHasOne.new(ability: @ability, base_data: @data, data: @data, reflection: reflection).preload
      else
        raise "Unknown macro: #{reflection.macro}"
      end
    end

    result
  end
end
