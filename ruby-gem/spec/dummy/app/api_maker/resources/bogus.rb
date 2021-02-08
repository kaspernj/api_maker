class Resources::Bogus < Resources::ApplicationResource
  # This file will make sure that only files ending with _resource.rb are considered
  def initialize
    raise "Non resource files shouldn't be included"
  end
end
