module ApiMaker::SpecHelper::BrowserLogs
  def browser_logs
    logs = if browser_firefox?
      []
    else
      chrome_logs
    end

    @recorded_browser_logs ||= []
    @recorded_browser_logs += logs

    logs
  end

  def chrome_logs
    if Gem.loaded_specs["selenium-webdriver"].version > Gem::Version.new("4.0.0")
      page.driver.browser.logs.get(:browser)
    else
      page.driver.browser.manage.logs.get(:browser)
    end
  end
end
