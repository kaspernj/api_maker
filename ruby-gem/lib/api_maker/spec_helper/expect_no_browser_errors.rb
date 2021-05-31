module ApiMaker::SpecHelper::ExpectNoBrowserErrors
  def expect_no_browser_errors
    logs = browser_logs
      .map(&:to_s)
      .reject { |log| log.include?("Warning: Can't perform a React state update on an unmounted component.") }
      .reject { |log| log.include?("DEBUG: ") }
      .join("\n")

    expect_no_browser_window_errors
    return if logs.blank? || logs.exclude?("SEVERE ")

    # Lets try one more time - just in case browser window error got registered meanwhile
    sleep 0.4
    expect_no_browser_window_errors

    raise logs
  end
end
