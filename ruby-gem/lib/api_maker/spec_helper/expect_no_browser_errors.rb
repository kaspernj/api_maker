module ApiMaker::SpecHelper::ExpectNoBrowserErrors
  def expect_no_browser_errors
    raise_browser_errors(browser_window_error_exceptions + browser_console_error_exceptions)
  end
end
