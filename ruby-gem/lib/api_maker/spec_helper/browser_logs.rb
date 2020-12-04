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
end
