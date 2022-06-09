require_relative "../../api_maker/api_helpers/api_maker_helpers" # Sometimes this file isn't auto-loaded so it needs to be manually required

class ApiMaker::IncludeHelpers < ApiMaker::ApplicationService
  attr_reader :klass

  def initialize(klass:)
    @klass = klass
  end

  def perform
    ApiMaker::Loader.load_api_helpers

    ::ApiHelpers.constants(false).each do |constant|
      klass.include ApiHelpers.const_get(constant)
    end

    succeed!
  end
end
