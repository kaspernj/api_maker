module WindowHelpers
  def reset_window_size_cache
    $current_width = nil # rubocop:disable Style/GlobalVars
    $current_height = nil # rubocop:disable Style/GlobalVars
  end

  def resize_to(width, height)
    if $current_width != width || $current_height != height # rubocop:disable Style/GlobalVars
      # Selenium can occasionally hang on the first resize after Capybara has reset the browser session.
      resize_browser_window(width, height)
      $current_width = width # rubocop:disable Style/GlobalVars
      $current_height = height # rubocop:disable Style/GlobalVars
    end
  end

private

  def resize_browser_window(width, height)
    attempts = 0

    begin
      attempts += 1

      Timeout.timeout(10) do
        Capybara.current_session.driver.browser.manage.window.resize_to(width, height)
      end
    rescue Timeout::Error, Timeout::ExitException, Selenium::WebDriver::Error::WebDriverError
      raise if attempts > 1

      Capybara.reset_sessions!
      reset_window_size_cache
      retry
    end
  end
end
