module ApiMaker::SpecHelper::BrowserErrors
  # Registers an RSpec hook that checks for browser JS errors after every system
  # example. RSpec routes after-hook errors through Example#set_exception, so the
  # JS errors are aggregated with the example's own failure (or fail an
  # otherwise-passing example) - a failing example then shows both the original
  # error and every JS error, each with its own backtrace.
  #
  # Call this once from the host app's spec setup, e.g.
  #   ApiMaker::SpecHelper::BrowserErrors.install!
  def self.install!(config = RSpec.configuration)
    config.after(:each, type: :system) do
      expect_no_browser_errors
    end
  end

  # Returns one exception per JS error recorded by +window.errorLogger+ (each
  # carries its own source-mapped backtrace), so every error can be reported
  # individually. Override +benign_browser_window_error?+ to drop expected ones.
  def browser_window_error_exceptions
    return [] unless error_logger_present?

    wait_for_error_logger_to_finish

    errors = execute_script("return window.errorLogger.getErrors()")
    return [] unless errors.is_a?(Array)

    errors
      .reject { |error| benign_browser_window_error?(error) }
      .map { |error| browser_window_error_exception(error) }
  end

  # Returns one exception per SEVERE console log that isn't ignored (by
  # +benign_browser_console_log?+ or an +on_test_error_log+ configuration proc).
  def browser_console_error_exceptions
    browser_logs
      .select { |log| log.level == "SEVERE" }
      .reject { |log| log.message.include?("\"Warning:") || log.message.include?("\"DEBUG: ") }
      .reject { |log| benign_browser_console_log?(log) || ignored_browser_log?(log) }
      .map { |log| browser_console_error_exception(log) }
  end

  # Raises the browser errors so RSpec reports each one with its own backtrace.
  # When the example itself already failed, RSpec aggregates these with that
  # failure (RSpec::Core::Example#set_exception), so both are shown.
  def raise_browser_errors(exceptions)
    return if exceptions.empty?
    return raise(exceptions.first) if exceptions.length == 1

    raise RSpec::Core::MultipleExceptionError.new(*exceptions)
  end

  def expect_no_browser_window_errors
    raise_browser_errors(browser_window_error_exceptions)
  end

  # Override to ignore JS errors that are expected/benign in a given app.
  def benign_browser_window_error?(_error)
    false
  end

  # Override to ignore console logs that are expected/benign in a given app.
  def benign_browser_console_log?(_log)
    false
  end

private

  def browser_window_error_exception(error)
    trace = []
    trace += error.fetch("backtrace") if error["backtrace"].is_a?(Array)
    trace += caller

    exception = ApiMaker::SpecHelper::JavaScriptError.new("#{error["errorClass"]}: #{error["message"]}")
    exception.set_backtrace(trace)
    exception
  end

  def browser_console_error_exception(log)
    ApiMaker::SpecHelper::JavaScriptError.new(log.message).tap do |exception|
      exception.set_backtrace(caller)
    end
  end

  def ignored_browser_log?(log)
    on_test_error_log_procs = ApiMaker::Configuration.current.instance_variable_get(:@on_test_error_log)

    on_test_error_log_procs.any? do |on_test_error_log_proc|
      on_test_error_log_proc.call(example: self, log:) == :ignore
    end
  end

  def wait_for_error_logger_to_finish
    Timeout.timeout(3) do
      sleep 0.1 while execute_script("return window.errorLogger.isWorkingOnError()")
    end
  end
end
