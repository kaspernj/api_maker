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
    page.driver.browser.manage.try(:logs).try(:get, :browser) ||
      page.driver.browser.logs.get(:browser)
  rescue NoMethodError => e
    if e.message.start_with?("undefined method `logs'")
      raise NoMethodError, "undefined method `logs' - try '--headless=new' instead of just '--headless'"
    else
      raise e
    end
  end
end
