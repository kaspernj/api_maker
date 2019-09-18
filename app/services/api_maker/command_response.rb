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
      @result[id] = {type: type, data: data}
    end
  end

  def threadding?
    ApiMaker::Configuration.current.threadding
  end

  def with_thread(&blk)
    if Rails.env.test? || !threadding?
      yield
    else
      spawn_thread(&blk)
    end
  end

private

  def spawn_thread
    @threads << Thread.new do
      Rails.application.executor.wrap do
        I18n.with_locale(locale) do
          yield
        end
      end
    rescue => error # rubocop:disable Style/RescueStandardError
      puts error.inspect
      puts error.backtrace

      Rails.logger.error error.message
      Rails.logger.error error.backtrace.join("\n")

      ApiMaker::Configuration.current.report_error(controller: controller, error: error)
    end
  end
end
