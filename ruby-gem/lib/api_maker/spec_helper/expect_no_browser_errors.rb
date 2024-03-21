module ApiMaker::SpecHelper::ExpectNoBrowserErrors
  def expect_no_browser_errors
    logs = browser_logs
      .keep_if do |log|
        log.level == "SEVERE" &&
          log.message.exclude?("\"Warning: React does not recognize the `%s` prop on a DOM element.") &&
          log.message.exclude?("\"Warning: Can't perform a React state update on a component that hasn't mounted yet.") &&
          log.message.exclude?("\"Warning: validateDOMNesting(...): %s cannot appear as a child of") &&
          log.message.exclude?("\"DEBUG: ")
      end

    expect_no_browser_window_errors

    return if logs.empty?

    # Lets try one more time - just in case browser window error is currently being recorded
    sleep 0.4
    expect_no_browser_window_errors

    raise logs.map(&:message).join("\n\n")
  end
end
