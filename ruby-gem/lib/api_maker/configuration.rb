class ApiMaker::Configuration
  attr_accessor(
    :ability_class_name,
    :before_create_event_callbacks,
    :devise_sign_in_enabled,
    :devise_sign_out_enabled,
    :profiling,
    :react_native_path,
    :threadding
  )

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
    self.ability_class_name = "ApiMaker::Ability"
    self.before_create_event_callbacks = []
    self.devise_sign_in_enabled = true
    self.devise_sign_out_enabled = true
    self.threadding = true

    @on_error = []
  end

  def ability_class
    ability_class_name.constantize
  end

  def before_create_event(&blk)
    before_create_event_callbacks << blk
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
