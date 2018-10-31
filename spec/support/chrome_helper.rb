module ChromeHelper
  def chrome_logs
    page.driver.browser.manage.logs.get(:browser)
  end

  def expect_no_chrome_errors
    logs = chrome_logs.map(&:to_s)
    return if !logs || !logs.join("\n").include?("SEVERE ")
    puts logs.join("\n")
    expect(logs).to eq nil
  end

  def chrome_logs
    page.driver.browser.manage.logs.get(:browser)
  end

  def wait_for_chrome
    WaitUtil.wait_for_condition("wait for chrome", timeout_sec: 6, delay_sec: 0.5) do
      expect_no_chrome_errors
      yield
    end
  end
end
