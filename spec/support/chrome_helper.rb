module ChromeHelper
  def chrome_logs
    page.driver.browser.manage.logs.get(:browser)
  end
end
