class ApiMaker::IncludeHelpers < ApiMaker::ApplicationService
  attr_reader :klass

  def initialize(klass:)
    @klass = klass
  end

  def perform
    ::ApiHelpers.constants(false).each do |constant|
      klass.include ApiHelpers.const_get(constant)
    end

    succeed!
  end
end
