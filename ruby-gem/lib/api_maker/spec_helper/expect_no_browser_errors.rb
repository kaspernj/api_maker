module ApiMaker::SpecHelper::ExpectNoBrowserErrors
  def expect_no_browser_errors
    on_test_error_log_procs = ApiMaker::Configuration.current.instance_variable_get(:@on_test_error_log)

    logs = browser_logs
      .keep_if do |log|
        log.level == "SEVERE" &&
          log.message.exclude?("\"Warning:") &&
          log.message.exclude?("\"DEBUG: ") &&
          on_test_error_log_procs.none? { |on_test_error_log_proc| on_test_error_log_proc.call(log:) != :ignore }
      end

    expect_no_browser_window_errors

    return if logs.empty?

    # Lets try one more time - just in case browser window error is currently being recorded
    sleep 0.4
    expect_no_browser_window_errors

    raise logs.map(&:message).join("\n\n")
  end
end
