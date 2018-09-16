class ApiMaker::MemoryStorage
  attr_reader :member_methods, :resources

  def self.current
    @current ||= ApiMaker::MemoryStorage.new
  end

  def initialize
    @member_methods = []
    @resources = []
  end

  def add_member_method(klass:, member_method:)
    @member_methods << {
      klass: klass,
      member_method: member_method
    }
  end

  def add_resource(klass:)
    @resources << {klass: klass}
  end
end
