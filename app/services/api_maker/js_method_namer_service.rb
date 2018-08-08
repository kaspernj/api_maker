class ApiMaker::JsMethodNamerService < ApiMaker::ApplicationService
  def initialize(name:)
    @name = name
  end

  def execute!
    camelized = @name.to_s.camelize
    new_name = "#{camelized[0..0].downcase}#{camelized[1..camelized.length]}"
    ServicePattern::Response.new(result: new_name)
  end
end
