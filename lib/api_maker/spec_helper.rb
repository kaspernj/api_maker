module ApiMaker::SpecHelper
  require_relative "spec_helper/wait_for_expect"
  include WaitForExpect

  class SelectorNotFoundError < RuntimeError; end
  class SelectorFoundError < RuntimeError; end

  def browser_logs
    if browser_firefox?
      []
    else
      chrome_logs
    end
  end

  def browser_firefox?
    capabilities = page.driver.browser.try(:capabilities)
    capabilities && capabilities[:browser_name] == "firefox"
  end

  def chrome_logs
    page.driver.browser.manage.logs.get(:browser)
  end

  def expect_no_browser_window_errors
    errors = execute_script("if (window.errorLogger) { return window.errorLogger.getErrors() }")
    return if !errors.is_a?(Array) || errors.empty?

    last_error = errors.last

    custom_trace = []
    custom_trace += last_error.fetch("backtrace") if last_error["backtrace"].is_a?(Array)
    custom_trace += caller

    error = RuntimeError.new("#{last_error["errorClass"]}: #{last_error["message"]}")
    error.set_backtrace(custom_trace)

    raise error
  end

  def expect_no_browser_errors
    expect_no_browser_window_errors

    logs = browser_logs.map(&:to_s)
    logs = logs.reject { |log| log.include?("Warning: Can't perform a React state update on an unmounted component.") }
    return if !logs || !logs.join("\n").include?("SEVERE ")

    # Lets try one more time - just in case error got registered meanwhile
    sleep 0.5
    expect_no_browser_window_errors

    # Else just raise with only the message and not the JS stacktrace
    raise logs.join("\n")
  end

  def expect_no_errors
    expect_no_flash_errors
    expect_no_browser_errors
  end

  def js_fill_in(element_id, with:)
    page.execute_script("document.querySelector(#{element_id.to_json}).value = #{with.to_json}")
  end

  def pretty_html
    require "htmlbeautifier"
    HtmlBeautifier.beautify(page.html)
  end

  def reset_indexeddb
    ApiMaker::ResetIndexedDbService.execute!(context: self)
  end

  def wait_for_and_find(selector, *args)
    element = find(selector, *args)
    expect_no_browser_errors
    element
  rescue Capybara::ElementNotFound
    expect_no_browser_errors
    raise ApiMaker::SpecHelper::SelectorNotFoundError, "Timed out waiting for selector: #{selector}"
  end

  def wait_for_browser(delay_sec: 0.2, message: "wait for browser", timeout_sec: 6)
    WaitUtil.wait_for_condition(message, timeout_sec: timeout_sec, delay_sec: delay_sec) do
      expect_no_browser_errors
      yield
    end
  end

  def wait_for_flash_message(expected_message, delay_sec: 0.2, timeout_sec: 6)
    received_messages = []

    WaitUtil.wait_for_condition("wait for flash message", timeout_sec: timeout_sec, delay_sec: delay_sec) do
      expect_no_browser_errors
      current_message = flash_message_text
      received_messages << current_message
      current_message == expected_message
    end

    expect_no_browser_errors
  rescue WaitUtil::TimeoutError
    expect(received_messages.uniq.reject(&:blank?)).to eq include expected_message
  end

  def wait_for_path(expected_path)
    expect(current_path).to eq expected_path
    expect_no_browser_errors
  end

  def wait_for_selector(selector, *args)
    expect(page).to have_selector selector, *args
    expect_no_browser_errors
  rescue Capybara::ElementNotFound
    expect_no_browser_errors
    raise ApiMaker::SpecHelper::SelectorNotFoundError, "Timed out waiting for selector: #{selector}"
  end

  def wait_for_selectors(*selectors)
    selectors.each do |selector|
      wait_for_selector(selector)
    end
  end

  def wait_for_no_selector(selector, *args)
    expect(page).to have_no_selector selector, *args
    expect_no_browser_errors
  rescue Capybara::ElementNotFound
    expect_no_browser_errors
    raise ApiMaker::SpecHelper::SelectorFoundError, "Timed out waiting for selector to disappear: #{selector}"
  end
end
