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
      yield
    else
      spawn_thread(&)
    end
  end

private

  def spawn_thread(&blk)
    parent_thread = Thread.current

    @threads << Thread.new do
      child_thread = Thread.current

      Rails.application.executor.wrap do
        ApiMaker::Configuration.current.on_thread_callbacks&.each do |on_thread_callback|
          on_thread_callback.call(parent_thread:, child_thread:)
        end

        I18n.with_locale(locale, &blk)
      end
    rescue => e # rubocop:disable Style/RescueStandardError
      puts e.inspect
      puts Rails.backtrace_cleaner.clean(e.backtrace)

      Rails.logger.error e.message
      Rails.logger.error Rails.backtrace_cleaner.clean(e.backtrace).join("\n")

      ApiMaker::Configuration.current.report_error(
        command: nil,
        controller:,
        error: e,
        response: nil
      )
    end
  end
end
