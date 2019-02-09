class ApiMaker::Configuration
  def self.current
    @current ||= ApiMaker::Configuration.new
  end

  def self.configure
    yield ApiMaker::Configuration.current
  end

  def initialize
    @on_error = []
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
