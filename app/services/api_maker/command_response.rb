class ApiMaker::CommandResponse
  attr_reader :locale, :result

  def initialize
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
      begin
        Rails.application.executor.wrap do
          I18n.with_locale(locale) do
            yield
          end
        end
      rescue => e # rubocop:disable Style/RescueStandardError
        puts e.inspect
        puts e.backtrace

        Rails.logger.error e.message
        Rails.logger.error e.backtrace.join("\n")

        ApiMaker::Configuration.current.report_error(e)
      end
    end
  end
end
