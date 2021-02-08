class Resources::Bogus < Resources::ApplicationResource
  def initialize
    raise "I Should not be loaded"
  end
end
