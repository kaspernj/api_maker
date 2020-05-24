class ApiMaker::Configuration
  attr_accessor :ability_class_name, :profiling, :react_native_path, :threadding

  def self.current
    @current ||= ApiMaker::Configuration.new
  end

  def self.configure
    yield ApiMaker::Configuration.current
  end

  def self.profile(name, &blk)
    if ApiMaker::Configuration.current.profiling
      Rack::MiniProfiler.step("AM #{name}", &blk)
    else
      yield
    end
  end

  def initialize
    @ability_class_name = "ApiMaker::Ability"
    @on_error = []
    @threadding = true
  end

  def ability_class
    ability_class_name.constantize
  end

  def on_error(&blk)
    @on_error << blk
  end

  def report_error(error)
    @on_error.each do |on_error|
      on_error.call(error)
    end
  end
end
