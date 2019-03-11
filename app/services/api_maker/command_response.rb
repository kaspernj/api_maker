class ApiMaker::CommandResponse
  attr_reader :result

  def initialize
    @mutex = Mutex.new
    @result = {}
    @threads = []
  end

  def fail_for_command(id, data)
    @mutex.synchronize do
      @result[id] = {type: :failed, data: data}
    end
  end

  def result_for_command(id, data)
    @mutex.synchronize do
      @result[id] = {type: :success, data: data}
    end
  end

  def with_thread
    @threads << Thread.new do
      begin
        Rails.application.executor.wrap do
          yield
        end
      rescue => e
        puts e.inspect
        puts e.backtrace

        Rails.logger.error e.message
        Rails.logger.error e.backtrace.join("\n")

        ApiMaker::Configuration.current.report_error(e)
      end
    end
  end

  def join_threads
    ActiveSupport::Dependencies.interlock.permit_concurrent_loads do
      @threads.each(&:join)
    end
  end
end
