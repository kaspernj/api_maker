require "fileutils"

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

  def write_browser_logs_artifact(example)
    logs = uniq_logs(recorded_browser_logs + browser_logs)
    debug_info = collect_debug_info
    artifact_dir = Rails.root.join("tmp/capybara/browser_logs")
    FileUtils.mkdir_p(artifact_dir)
    filename = browser_log_filename(example)
    artifact_path = artifact_dir.join(filename)

    File.open(artifact_path, "w") do |file|
      write_browser_log_artifact_header(file:, debug_info:, example:, logs:)
      write_browser_log_artifact_entries(file:, logs:)
    end
  rescue StandardError => e
    warn("Failed to write browser log artifact: #{e.class}: #{e.message}")
  end

private

  def uniq_logs(logs)
    logs.uniq { |log| [log.try(:timestamp), log.try(:level), log.try(:message)] }
  end

  def browser_log_filename(example)
    timestamp = Time.current.strftime("%Y%m%d-%H%M%S")
    example_name = example.full_description
      .downcase
      .gsub(/[^a-z0-9]+/, "_")
      .gsub(/\A_+|_+\z/, "")
      .slice(0, 120)

    "#{timestamp}_#{example_name}.log"
  end

  def write_browser_log_artifact_header(file:, debug_info:, example:, logs:)
    file.puts "example: #{example.full_description}"
    file.puts "status: failed"
    file.puts "exception: #{example.exception.class}: #{example.exception.message}" if example.exception
    file.puts "browser: #{browser_name}"
    file.puts "current_url: #{current_url}"
    file.puts "debug_summary: #{debug_info.fetch(:summary)}"
    file.puts "debug_abilities: #{debug_info.fetch(:abilities)}"
    file.puts "logs_count: #{logs.length}"
    file.puts
  end

  def write_browser_log_artifact_entries(file:, logs:)
    logs.each_with_index do |log, index|
      file.puts "[#{index + 1}]"
      file.puts "timestamp: #{log.try(:timestamp)}"
      file.puts "level: #{log.try(:level)}"
      file.puts "message: #{log.try(:message)}"
      file.puts
    end
  end

  def collect_debug_info
    {
      summary: debug_text_for("[data-class='components--admin--layout--menu--menu-content--debug-summary']"),
      abilities: debug_text_for("[data-class='components--admin--layout--menu--menu-content--debug-abilities']")
    }
  rescue StandardError => e
    {
      summary: "error collecting debug info: #{e.class}: #{e.message}",
      abilities: "error collecting debug info: #{e.class}: #{e.message}"
    }
  end

  def debug_text_for(selector)
    script = <<~JS
      (() => {
        const element = document.querySelector(#{selector.to_json})
        return element ? element.textContent.trim() : "missing"
      })()
    JS

    page.evaluate_script(script)
  end
end
