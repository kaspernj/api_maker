class ApiMaker::MemoryStorage
  attr_reader :collection_methods, :member_methods, :resources

  def self.current
    @current ||= ApiMaker::MemoryStorage.new
  end

  def initialize
    @collection_methods = []
    @member_methods = []
    @resources = []
  end

  def add_collection_method(klass:, collection_method:)
    return if @collection_methods.any? { |collection_method_i| collection_method_i.fetch(:collection_method) == collection_method }

    @collection_methods << {
      klass: klass,
      collection_method: collection_method
    }
  end

  def add_member_method(klass:, member_method:)
    return if @member_methods.any? { |member_method_i| member_method_i.fetch(:member_method) == member_method }

    @member_methods << {
      klass: klass,
      member_method: member_method
    }
  end

  def add_resource(klass:)
    return if klass.name == "Resources::ApplicationResource"
    @resources << {klass: klass}
  end
end
