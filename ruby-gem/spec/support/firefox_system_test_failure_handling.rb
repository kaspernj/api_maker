module FirefoxSystemTestFailureHandling
  def take_failed_screenshot
    return if ENV["SELENIUM_DRIVER"] == "firefox"

    super
  rescue Selenium::WebDriver::Error::UnsupportedOperationError,
         Selenium::WebDriver::Error::WebDriverError,
         EOFError => e
    warn("Failed to capture screenshot: #{e.class}: #{e.message}")
  end
end
