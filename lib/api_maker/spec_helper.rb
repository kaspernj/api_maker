module ApiMaker::SpecHelper
  def chrome_logs
    page.driver.browser.manage.logs.get(:browser)
  end

  def expect_no_chrome_window_errors
    sleep 1

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

  def expect_no_chrome_errors
    logs = chrome_logs.map(&:to_s)
    logs = logs.reject { |log| log.include?("Warning: Can't perform a React state update on an unmounted component.") }
    return if !logs || !logs.join("\n").include?("SEVERE ")

    expect_no_chrome_window_errors

    puts logs.join("\n")
    expect(logs).to eq nil
  end

  def expect_no_errors
    expect_no_flash_errors
    expect_no_chrome_errors
  end

  def js_fill_in(element_id, with:)
    page.execute_script("document.querySelector(#{element_id.to_json}).value = #{with.to_json}")
  end

  def pretty_html
    require "htmlbeautifier"
    HtmlBeautifier.beautify(page.html)
  end

  def reset_indexeddb
    execute_script "
      indexedDB.databases().then(function(databases) {
        var promises = []
        for(var database of databases) {
          promises.push(indexedDB.deleteDatabase(database.name))
        }

        Promise.all(promises).then(function() {
          console.error('All databases was deleted')
        })
      })
    "

    wait_for_condition do
      logs_text = chrome_logs.map(&:message).join("\n")
      logs_text.include?("\"All databases was deleted\"")
    end
  end

  def wait_for_chrome(delay_sec: 0.5, timeout_sec: 6)
    WaitUtil.wait_for_condition("wait for chrome", timeout_sec: timeout_sec, delay_sec: delay_sec) do
      expect_no_chrome_errors
      yield
    end
  end

  def wait_for_flash_message(expected_message, delay_sec: 0.5, timeout_sec: 10)
    received_messages = []

    begin
      WaitUtil.wait_for_condition("wait for flash message", timeout_sec: timeout_sec, delay_sec: delay_sec) do
        expect_no_chrome_errors
        current_message = flash_message_text
        received_messages << current_message
        current_message == expected_message
      end
    rescue WaitUtil::TimeoutError
      expect(received_messages.uniq.reject(&:blank?)).to eq include expected_message
    end
  end

  def wait_for_selector(selector)
    wait_for_chrome { page.has_selector?(selector) }
  end

  def wait_for_selectors(*selectors)
    selectors.each do |selector|
      wait_for_selector(selector)
    end
  end
end
