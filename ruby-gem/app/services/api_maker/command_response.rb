class ApiMaker::CommandResponse
  attr_reader :controller, :locale, :result

  def initialize(controller:)
    @controller = controller
    @locale = I18n.locale
    @mutex = Mutex.new
    @result = {}
    @threads = []
  end

  def error_for_command(id, data)
    respond_to_command(id, data, :error)
  end

  def fail_for_command(id, data)
    respond_to_command(id, data, :failed)
  end

  def result_for_command(id, data)
    respond_to_command(id, data, :success)
  end

  def log_for_command(id, message)
    transmit_command_event(id, {message:}, "api_maker_command_log")
  end

  def progress_for_command(id, data)
    transmit_command_event(id, data, "api_maker_command_progress")
  end

  def join_threads
    ActiveSupport::Dependencies.interlock.permit_concurrent_loads do
      @threads.each(&:join)
    end
  end

  def respond_to_command(id, data, type)
    @mutex.synchronize do
      @result[id] = {type:, data:}
    end
  end

  def threadding?
    ApiMaker::Configuration.current.threadding
  end

  def with_thread(&)
    if Rails.env.test? || !threadding?
      ApiMaker::CommandTimeoutGuard.wrap(&)
    else
      spawn_thread(&)
    end
  end

private

  def transmit_command_event(id, payload, type)
    return unless controller.respond_to?(:transmit_command_event)

    controller.transmit_command_event(command_id: id, payload:, type:)
  end

  def spawn_thread(&blk)
    parent_thread = Thread.current

    @threads << Thread.new do
      # Errors are either reported via report_thread_error below or re-raised
      # to join_threads for the channel rescue to handle, so suppress Ruby's
      # default thread-death stderr print to avoid duplicate output.
      Thread.current.report_on_exception = false
      run_thread_body(parent_thread:, child_thread: Thread.current, &blk)
    rescue ApiMaker::CommandTimeoutError
      # Propagate so join_threads re-raises in the channel thread and the
      # request returns a timeout_error response instead of silently dropping
      # the command and leaving the worker to finish its side effects.
      raise
    rescue => e # rubocop:disable Style/RescueStandardError
      report_thread_error(e)
    end
  end

  def run_thread_body(parent_thread:, child_thread:, &blk)
    Rails.application.executor.wrap do
      ApiMaker::Configuration.current.on_thread_callbacks&.each do |on_thread_callback|
        on_thread_callback.call(parent_thread:, child_thread:)
      end

      ApiMaker::CommandTimeoutGuard.wrap do
        I18n.with_locale(locale, &blk)
      end
    end
  end

  def report_thread_error(error)
    puts error.inspect
    puts Rails.backtrace_cleaner.clean(error.backtrace)

    Rails.logger.error error.message
    Rails.logger.error Rails.backtrace_cleaner.clean(error.backtrace).join("\n")

    ApiMaker::Configuration.current.report_error(
      command: nil,
      controller:,
      error:,
      response: nil
    )
  end
end
