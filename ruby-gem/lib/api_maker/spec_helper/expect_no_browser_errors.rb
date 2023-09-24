module ApiMaker::SpecHelper::ExpectNoBrowserErrors
  def expect_no_browser_errors
    logs = browser_logs.keep_if { |log| log.level == "SEVERE" }

    expect_no_browser_window_errors

    return if logs.empty?

    # Lets try one more time - just in case browser window error is currently being recorded
    sleep 0.4
    expect_no_browser_window_errors

    raise logs.map(&:message).join("\n\n")
  end
end
