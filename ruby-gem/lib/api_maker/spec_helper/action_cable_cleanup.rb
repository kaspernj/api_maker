module ApiMaker::SpecHelper::ActionCableCleanup
  CAPYBARA_DISCONNECT_ERRORS = [
    EOFError,
    Errno::ECONNREFUSED,
    Errno::ECONNRESET
  ].freeze

  CAPYBARA_DISCONNECT_MESSAGES = [
    "browser has closed the connection",
    "chrome not reachable",
    "disconnected",
    "failed to open tcp connection",
    "invalid session id",
    "session deleted because of page crash",
    "unable to connect to",
    "unable to read true browser url"
  ].freeze

  # Resets the Api Maker realtime runtime (ActionCable consumer, connection pool,
  # websocket request client) from the browser side by calling the auto-registered
  # JS hook. Returns a status symbol:
  #   :ok           — reset ran successfully
  #   :missing      — hook not on the page (fresh session, about:blank, non-app page)
  #   :error        — the hook threw; caller should treat the runtime as untrusted
  #   :unavailable  — no driver yet or disconnected during the call
  def reset_api_maker_realtime_runtime!
    session = Capybara.current_session
    return :unavailable unless api_maker_session_has_driver?(session)

    status = :unavailable
    api_maker_ignore_capybara_disconnect do
      result = session.evaluate_async_script(<<~JS, 5)
        const done = arguments[0]
        const timeoutMs = arguments[1]
        const resetHook = globalThis.__apiMakerResetRealtimeRuntimeForSystemSpecs

        if (!resetHook) {
          done({status: "missing"})
          return
        }

        Promise
          .resolve(resetHook({timeoutMs}))
          .then(() => done({status: "ok"}))
          .catch((error) => done({errorClass: error?.constructor?.name, errorMessage: error?.message, status: "error"}))
      JS

      status = result["status"].to_sym
      warn "Api Maker realtime reset failed: #{result["errorClass"]}: #{result["errorMessage"]}" if status == :error
    end

    status
  rescue Capybara::NotSupportedByDriverError
    :unavailable
  end

  # Waits for all server-side ActionCable connections to close. Call this after
  # quitting/resetting the browser session so that ActionCable disconnect Fibers
  # finish and release the shared DB connection before the next test starts.
  #
  # Without this wait, the disconnect Fibers can still hold the DB connection
  # when the next test calls DatabaseCleaner.start, causing "This connection is
  # in use by: #<Fiber:...>" and eventually a force-reconnect that permanently
  # breaks use_transactional_fixtures for the rest of the test run.
  def wait_for_action_cable_connections_to_close!(timeout: 5)
    deadline = Process.clock_gettime(Process::CLOCK_MONOTONIC) + timeout

    while ActionCable.server.connections.any?
      break if Process.clock_gettime(Process::CLOCK_MONOTONIC) > deadline

      sleep 0.05
    end
  end

private

  def api_maker_session_has_driver?(session)
    session.instance_variable_get(:@driver).present?
  end

  def api_maker_ignore_capybara_disconnect
    yield
  rescue *CAPYBARA_DISCONNECT_ERRORS, Selenium::WebDriver::Error::WebDriverError => e
    raise unless api_maker_capybara_disconnect_error?(e)

    nil
  end

  def api_maker_capybara_disconnect_error?(error)
    return true if CAPYBARA_DISCONNECT_ERRORS.any? { |disconnect_error| error.is_a?(disconnect_error) }
    return false unless error.is_a?(Selenium::WebDriver::Error::WebDriverError)

    error_message = error.message.to_s.downcase

    CAPYBARA_DISCONNECT_MESSAGES.any? { |disconnect_message| error_message.include?(disconnect_message) }
  end
end
