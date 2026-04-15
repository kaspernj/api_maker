require "digest"

class ApiMaker::RequestsChannel < ApplicationCable::Channel
  DB_TIMEOUT_ERRORS = [ActiveRecord::QueryCanceled].tap do |errors|
    errors << ActiveRecord::StatementTimeout if defined?(ActiveRecord::StatementTimeout)
  end.freeze

  def subscribed
    @last_command_event_sequence_by_request_id = {}
    @execute_mutex = Mutex.new if resolved_concurrency_mode == :mutex
  end

  def execute(data)
    fingerprint = request_fingerprint(data)
    request_uid = data["request_uid"].presence || legacy_request_uid(data:, request_fingerprint: fingerprint)
    request_id = data.fetch("request_id")
    @last_command_event_sequence_by_request_id[request_id] = data["last_command_event_sequence"].to_i
    request_registration = ApiMaker::RequestsRegistry.register_request(
      channel: self,
      request_fingerprint: fingerprint,
      request_id:,
      request_uid:
    )

    transmit_received(request_id)
    replay_command_events(
      command_events: request_registration.fetch(:command_events),
      request_id:
    )

    if request_registration.fetch(:response_payload)
      transmit_request_payload(request_id:, response_payload: request_registration.fetch(:response_payload))
      return
    end

    return unless request_registration.fetch(:start_execution)

    # With Fiber-level isolation each Fiber gets its own DB connection from
    # the pool, so requests can run concurrently. Without it (e.g. test env
    # using transactional fixtures) we fall back to a mutex so concurrent
    # Fibers don't conflict on the shared thread connection.
    execute_command(data, fingerprint:, request_uid:)
  rescue ApiMaker::CommandTimeoutError, *DB_TIMEOUT_ERRORS => e
    response_payload = {
      response: {errors: [{message: e.message, type: :timeout_error}], success: false},
      type: "api_maker_request_error"
    }

    ApiMaker::RequestsRegistry.complete_request(request_uid:, response_payload:, status: :failed) if request_uid
    transmit_request_payloads(request_uid:, response_payload:) if request_uid
  rescue => e # rubocop:disable Style/RescueStandardError
    response_payload = {
      response: {errors: [{message: e.message, type: :runtime_error}], success: false},
      type: "api_maker_request_error"
    }

    ApiMaker::RequestsRegistry.complete_request(request_uid:, response_payload:, status: :failed) if request_uid
    transmit_request_payloads(request_uid:, response_payload:) if request_uid
    raise e
  end

  def unsubscribed
    ApiMaker::RequestsRegistry.unregister_channel(self)
  end

  def last_command_event_sequence_for_request_id(request_id)
    @last_command_event_sequence_by_request_id&.fetch(request_id, 0) || 0
  end

  def transmit_command_event(command_id:, payload:, request_uid:, type:)
    command_event = ApiMaker::RequestsRegistry.record_command_event(command_id:, payload:, request_uid:, type:)
    return unless command_event

    ApiMaker::RequestsRegistry.request_subscriptions(request_uid:).each do |request_subscription|
      request_subscription.fetch(:request_ids).each do |request_id|
        request_subscription.fetch(:channel).__send__(
          :transmit_command_event_for_request,
          command_event:,
          request_id:
        )
      end
    end
  end

private

  def execute_command(data, fingerprint:, request_uid:)
    case resolved_concurrency_mode
    when :mutex
      @execute_mutex.synchronize do
        ActiveRecord::Base.connection_pool.with_connection { run_command_executor_with_timeout(data, fingerprint:, request_uid:) }
      end
    when :multi_connection, :none
      ActiveRecord::Base.connection_pool.with_connection { run_command_executor_with_timeout(data, fingerprint:, request_uid:) }
    end
  end

  def run_command_executor_with_timeout(data, fingerprint:, request_uid:)
    timeout_seconds = ApiMaker::Configuration.current.command_timeout
    connection = ActiveRecord::Base.connection

    with_statement_timeout(connection, timeout_seconds) do
      with_watchdog(connection, timeout_seconds) do
        run_command_executor(data, fingerprint:, request_uid:)
      end
    end
  end

  # Sets a DB-level statement timeout for the duration of the block so
  # queries abort in-DB when the overall command timeout is exceeded.
  # Always resets in ensure so the connection is safe to return to the pool.
  # Only the connection checked out at the channel level is bounded; commands
  # that touch other connection pools only get the Ruby watchdog.
  def with_statement_timeout(connection, timeout_seconds)
    return yield if timeout_seconds.nil? || timeout_seconds <= 0

    set_sql, reset_sql = statement_timeout_sql(connection, timeout_seconds)
    return yield unless set_sql

    begin
      connection.execute(set_sql)
      yield
    ensure
      begin
        connection.execute(reset_sql)
      rescue StandardError => e
        ApiMaker::Configuration.current.report_error(e)
      end
    end
  end

  # MySQL's max_execution_time only bounds read-only SELECTs; the Ruby watchdog
  # catches writes that overrun. MariaDB's max_statement_time covers all
  # statements. PostgreSQL's statement_timeout covers all statements.
  def statement_timeout_sql(connection, timeout_seconds)
    case ApiMaker::ConnectionDatabaseKind.for(connection)
    when :postgres
      timeout_ms = (timeout_seconds * 1000).to_i
      ["SET statement_timeout = #{timeout_ms}", "RESET statement_timeout"]
    when :mysql
      timeout_ms = (timeout_seconds * 1000).to_i
      ["SET SESSION max_execution_time = #{timeout_ms}", "SET SESSION max_execution_time = 0"]
    when :mariadb
      seconds = timeout_seconds.to_f
      ["SET SESSION max_statement_time = #{seconds}", "SET SESSION max_statement_time = 0"]
    end
  end

  # Spawns a per-request timer thread that, when the timeout expires,
  # cancels any in-flight PG query via the out-of-band protocol and
  # raises ApiMaker::CommandTimeoutError on the worker thread so pure-Ruby
  # work also unwinds. No-op on normal completion. MySQL/MariaDB rely on
  # the session-level statement timeout plus the Thread#raise path.
  def with_watchdog(connection, timeout_seconds)
    return yield if timeout_seconds.nil? || timeout_seconds <= 0

    worker = Thread.current
    state_mutex = Mutex.new
    finished = false
    raw_connection = watchdog_raw_connection(connection)

    timer = Thread.new do
      sleep timeout_seconds
      state_mutex.synchronize do
        next if finished

        finished = true
        cancel_raw_connection(raw_connection)
        worker.raise(ApiMaker::CommandTimeoutError.new("Command exceeded timeout of #{timeout_seconds}s"))
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

  def watchdog_raw_connection(connection)
    return nil unless ApiMaker::ConnectionDatabaseKind.for(connection) == :postgres

    connection.raw_connection
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

  def resolved_concurrency_mode
    @resolved_concurrency_mode ||= begin
      configured = ApiMaker::Configuration.current.request_concurrency_mode

      mode = if configured == :auto
        fiber_isolation? ? :multi_connection : :mutex
      else
        configured
      end

      unless ApiMaker::Configuration::REQUEST_CONCURRENCY_MODES.include?(mode)
        raise ArgumentError, "Invalid request_concurrency_mode: #{mode.inspect}. Must be one of #{ApiMaker::Configuration::REQUEST_CONCURRENCY_MODES.inspect}"
      end

      mode
    end
  end

  def fiber_isolation?
    ActiveSupport::IsolatedExecutionState.respond_to?(:isolation_level) &&
      ActiveSupport::IsolatedExecutionState.isolation_level == :fiber
  rescue StandardError
    false
  end

  def run_command_executor(data, fingerprint:, request_uid:)
    response = ApiMaker::CommandRequestExecutor.execute!(
      controller: request_context(data, request_fingerprint: fingerprint, request_uid:),
      payload: data.fetch("request")
    )
    response_payload = {
      response:,
      type: "api_maker_request_response"
    }

    ApiMaker::RequestsRegistry.complete_request(request_uid:, response_payload:, status: :completed)
    transmit_request_payloads(request_uid:, response_payload:)
  end

  def replay_command_events(command_events:, request_id:)
    command_events.each do |command_event|
      transmit_command_event_for_request(command_event:, request_id:)
    end
  end

  def legacy_request_uid(data:, request_fingerprint:)
    legacy_scope = current_session_id.presence || current_user&.id || object_id

    "legacy-request-#{legacy_scope}-#{request_fingerprint}-#{data.fetch("request_id")}"
  end

  def request_context(data, request_fingerprint:, request_uid:)
    ApiMaker::ActionCableRequestContext.new(
      api_maker_args: {current_user:}.merge((data["global"] || {}).symbolize_keys),
      channel: self,
      request_fingerprint:,
      request_uid:
    )
  end

  def request_fingerprint(data)
    Digest::SHA256.hexdigest(
      JSON.generate(
        global: data["global"],
        request: data.fetch("request")
      )
    )
  end

  def transmit_received(request_id)
    transmit(
      {
        request_id:,
        type: "api_maker_request_received"
      }
    )
  end

  def transmit_response(request_id, response)
    transmit(
      {
        request_id:,
        response:,
        type: "api_maker_request_response"
      }
    )
  end

  def transmit_request_payload(request_id:, response_payload:)
    transmit(
      {
        request_id:
      }.merge(response_payload)
    )
  end

  def transmit_command_event_for_request(command_event:, request_id:)
    @last_command_event_sequence_by_request_id ||= {}
    @last_command_event_sequence_by_request_id[request_id] = command_event.fetch(:command_event_sequence)

    transmit(
      {
        command_event_sequence: command_event.fetch(:command_event_sequence),
        command_id: command_event.fetch(:command_id),
        request_id:,
        type: command_event.fetch(:type)
      }.merge(command_event.fetch(:payload))
    )
  end

  def transmit_request_payloads(request_uid:, response_payload:)
    ApiMaker::RequestsRegistry.request_subscriptions(request_uid:).each do |request_subscription|
      request_subscription.fetch(:request_ids).each do |request_id|
        request_subscription.fetch(:channel).__send__(:transmit_request_payload, request_id:, response_payload:)
      end
    end
  end
end
