require "waitutil"

module ApiMaker::SpecHelper # rubocop:disable Metrics/ModuleLength
  autoload :ExecuteCollectionCommand, "#{__dir__}/spec_helper/execute_collection_command"
  autoload :ExecuteMemberCommand, "#{__dir__}/spec_helper/execute_member_command"

  require_relative "spec_helper/attribute_row_helpers"
  require_relative "spec_helper/browser_logs"
  require_relative "spec_helper/expect_no_browser_errors"
  require_relative "spec_helper/query_params"
  require_relative "spec_helper/wait_for_expect"
  require_relative "spec_helper/wait_for_flash_message"
  require_relative "spec_helper/wait_for_selector"
  require_relative "spec_helper/worker_plugins_helpers"
  include BrowserLogs
  include ApiMaker::ExpectToBeAbleToHelper
  include AttributeRowHelpers
  include ExpectNoBrowserErrors
  include QueryParams
  include WaitForExpect
  include WaitForFlashMessage
  include WaitForSelector
  include WorkerPluginsHelpers

  class JavaScriptError < RuntimeError; end
  class SelectorNotFoundError < RuntimeError; end
  class SelectorFoundError < RuntimeError; end

  def browser_chrome?
    browser_name == "chrome"
  end

  def browser_firefox?
    browser_name == "firefox"
  end

  def browser_name
    capabilities = page.driver.browser.try(:capabilities)
    raise "Browser didn't have required capabilities" unless capabilities

    browser_name = capabilities[:browser_name]
    raise "Couldn't detect browser name" unless browser_name

    browser_name
  end

  def confirm_accept
    page.driver.browser.switch_to.alert.accept
  end

  def error_logger_present?
    execute_script("return Boolean(window.errorLogger)")
  end

  def expect_no_browser_window_errors
    unless error_logger_present?
      Rails.logger.error "API maker: Error logger hasn't been set up on window, so we can't delegate JS errors to Ruby"
      return
    end

    # Wait until error logger has finished loading source maps and parsed errors
    loop do
      is_working_on_error = execute_script("return window.errorLogger.isWorkingOnError()")
      break unless is_working_on_error

      sleep 0.1
    end

    errors = execute_script("return window.errorLogger.getErrors()")

    return if errors.empty?

    last_error = errors.last

    custom_trace = []
    custom_trace += last_error.fetch("backtrace") if last_error["backtrace"].is_a?(Array)
    custom_trace += caller

    error = JavaScriptError.new("#{last_error["errorClass"]}: #{last_error["message"]}")
    error.set_backtrace(custom_trace)

    raise error
  end

  def expect_no_errors
    expect_no_flash_errors
    expect_no_browser_errors
  end

  def js_fill_in(element_id, with:)
    page.execute_script("document.querySelector(#{element_id.to_json}).value = #{with.to_json}")
  end

  def model_column_selector(model, identifier)
    ".#{model.model_name.singular.dasherize}-row[data-model-id='#{model.id}'] .live-table-column[data-identifier='#{identifier}']"
  end

  def model_row_selector(model)
    ".#{model.model_name.singular.dasherize}-row[data-model-id='#{model.id}']"
  end

  def model_row_destroy_button_selector(model)
    "#{model_row_selector(model)} .destroy-button"
  end

  def model_row_edit_button_selector(model)
    "#{model_row_selector(model)} .edit-button"
  end

  def pretty_html
    require "htmlbeautifier"
    HtmlBeautifier.beautify(page.html)
  end

  def recorded_browser_logs
    @recorded_browser_logs || []
  end

  def reset_indexeddb
    ApiMaker::ResetIndexedDbService.execute!(context: self)
  end

  def wait_for_action_cable_to_connect
    sleep 1
  end

  def wait_for_and_find(selector, *args, **opts)
    element = find(selector, *args, **opts)
    expect_no_browser_errors
    element
  rescue Capybara::ElementNotFound => e
    expect_no_browser_errors
    raise ApiMaker::SpecHelper::SelectorNotFoundError, e.message
  end

  def wait_for_browser(delay_sec: 0.2, message: "wait for browser", timeout_sec: 6)
    WaitUtil.wait_for_condition(message, timeout_sec: timeout_sec, delay_sec: delay_sec) do
      expect_no_browser_errors
      yield
    end
  end

  def wait_for_path(expected_path, **args)
    args[:ignore_query] = true unless args.key?(:ignore_query)

    expect(page).to have_current_path(expected_path, **args)
    expect_no_browser_errors
  rescue RSpec::Expectations::ExpectationNotMetError => e
    expect_no_browser_errors
    raise e
  end
end
