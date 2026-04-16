class ApiMaker::CommandTimeoutGuard
  THREAD_LOCAL_KEY = :api_maker_command_timeout_active

  # Applies the configured command timeout to the current thread: sets a
  # session-level DB statement timeout on the thread's own AR connection and
  # starts a watchdog that raises ApiMaker::CommandTimeoutError on this thread
  # if the block exceeds the timeout. Must run inside the thread that actually
  # issues the command's SQL. A thread-local guard skips nested wraps so the
  # outer call's budget is honored when with_thread runs synchronously.
  def self.wrap(&)
    return yield if Thread.current[THREAD_LOCAL_KEY]

    Thread.current[THREAD_LOCAL_KEY] = true
    begin
      new.wrap(&)
    ensure
      Thread.current[THREAD_LOCAL_KEY] = false
    end
  end

  def wrap(&)
    @timeout_seconds = ApiMaker::Configuration.current.command_timeout
    return yield if @timeout_seconds.nil? || @timeout_seconds <= 0

    @connection = active_record_connection
    return yield unless @connection

    with_statement_timeout do
      with_watchdog(&)
    end
  end

private

  def active_record_connection
    ActiveRecord::Base.connection
  rescue StandardError
    nil
  end

  def with_statement_timeout
    set_sql, reset_sql = statement_timeout_sql
    return yield unless set_sql

    begin
      @connection.execute(set_sql)
      yield
    ensure
      begin
        @connection.execute(reset_sql)
      rescue StandardError => e
        ApiMaker::Configuration.current.report_error(e)
      end
    end
  end

  # MySQL's max_execution_time only bounds read-only SELECTs; the Ruby watchdog
  # catches writes that overrun. MariaDB's max_statement_time covers all
  # statements. PostgreSQL's statement_timeout covers all statements.
  def statement_timeout_sql
    case ApiMaker::ConnectionDatabaseKind.for(@connection)
    when :postgres
      timeout_ms = (@timeout_seconds * 1000).to_i
      ["SET statement_timeout = #{timeout_ms}", "RESET statement_timeout"]
    when :mysql
      timeout_ms = (@timeout_seconds * 1000).to_i
      ["SET SESSION max_execution_time = #{timeout_ms}", "SET SESSION max_execution_time = 0"]
    when :mariadb
      seconds = @timeout_seconds.to_f
      ["SET SESSION max_statement_time = #{seconds}", "SET SESSION max_statement_time = 0"]
    end
  end

  def with_watchdog
    worker = Thread.current
    state_mutex = Mutex.new
    finished = false
    raw_connection = watchdog_raw_connection

    timer = Thread.new do
      sleep @timeout_seconds
      state_mutex.synchronize do
        next if finished

        finished = true
        cancel_raw_connection(raw_connection)
        worker.raise(ApiMaker::CommandTimeoutError.new("Command exceeded timeout of #{@timeout_seconds}s"))
      end
    rescue StandardError => e
      ApiMaker::Configuration.current.report_error(e)
    end

    begin
      yield
    ensure
      state_mutex.synchronize { finished = true }
      timer.kill if timer.alive?
      timer.join
    end
  end

  def watchdog_raw_connection
    return nil unless ApiMaker::ConnectionDatabaseKind.for(@connection) == :postgres

    @connection.raw_connection
  rescue StandardError
    nil
  end

  def cancel_raw_connection(raw_connection)
    return if raw_connection.nil?
    return unless raw_connection.respond_to?(:cancel)

    raw_connection.cancel
  rescue StandardError => e
    ApiMaker::Configuration.current.report_error(e)
  end
end
