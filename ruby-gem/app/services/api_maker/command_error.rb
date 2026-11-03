# Maps a raised command error onto the (error_type, message) pair that
# ApiMaker::BaseCommand surfaces to the client in its command response.
# Included into ApiMaker::BaseCommand's singleton so these read as ordinary
# class methods there.
module ApiMaker::CommandError
  # Process-wide counters so repeated client-input rejections (missing
  # parameters, invalid search terms) stay visible in the logs even though each
  # request only sees its own occurrence (a rejected client payload no longer
  # creates a bug report). They cannot be frozen: the mutex-guarded increment
  # writes to them (a frozen hash raised FrozenError at request time in CI, see
  # STC-633).
  # rubocop:disable Style/MutableConstant
  MISSING_PARAMETER_COUNTER = {count: 0}
  MISSING_PARAMETER_COUNTER_MUTEX = Mutex.new
  INVALID_SEARCH_TERM_COUNTER = {count: 0}
  INVALID_SEARCH_TERM_COUNTER_MUTEX = Mutex.new
  # rubocop:enable Style/MutableConstant

  # Ransack's own wording for a q key it cannot resolve (search.rb) and for a
  # resolvable attribute carrying a predicate Ransack does not know
  # (nodes/condition.rb). Both forms end with the offending key, which is the
  # part the client has to fix.
  INVALID_SEARCH_TERM_PATTERN = /\A(Invalid search term|No valid predicate for) (\S+)\z/

  def missing_parameter_count
    MISSING_PARAMETER_COUNTER[:count]
  end

  def invalid_search_term_count
    INVALID_SEARCH_TERM_COUNTER[:count]
  end

  def unpermitted_parameters?(error)
    error.is_a?(ActionController::UnpermittedParameters)
  end

  # A required command parameter (the resource's params.require(:model) in
  # permitted_params) was absent from the client payload. Like unpermitted
  # parameters this is a client-input problem, not a server bug.
  def missing_parameter?(error)
    error.is_a?(ActionController::ParameterMissing)
  end

  # A search term (a q key) that Ransack could not resolve to a ransackable
  # scope or to an attribute plus a registered predicate. With
  # config.ignore_unknown_conditions = false — this gem's dummy app and Nemoa
  # both set it, because a silently skipped key hides a broken filter — an
  # unknown key raises instead of being skipped, so a client that invents a
  # predicate name ("lte" where Ransack only has "lteq", see STOE-199) is a
  # rejected payload, not a server failure.
  #
  # Ransack >= 4 raises Ransack::InvalidSearchError. Ransack 3, which the
  # gemspec still allows, raises a bare ArgumentError with the same message and
  # defines no error class of its own; matching that one needs Ransack's exact
  # wording so an unrelated ArgumentError still reports as a server error.
  def invalid_search_term?(error)
    return true if defined?(Ransack::InvalidSearchError) && error.is_a?(Ransack::InvalidSearchError)

    error.is_a?(ArgumentError) && INVALID_SEARCH_TERM_PATTERN.match?(error.message.to_s)
  end

  # The offending key named by Ransack's message, or nil for the ransack errors
  # that carry no key ("Invalid combinator ...").
  def invalid_search_term_name(error)
    INVALID_SEARCH_TERM_PATTERN.match(error.message.to_s)&.[](2)
  end

  # Unpermitted parameters are a client-input problem, not a server bug: the
  # resource deliberately rejected a parameter. Surface them as a dedicated,
  # non-500 error type with a human-readable message instead of lumping them
  # in as "Internal server error" (:runtime_error).
  # Client contract errors: the request itself disagrees with the API
  # contract. They must stay loud for the caller but must not be reported as
  # server faults (no "Internal server error", no bug report).
  def client_contract_error?(error)
    error.is_a?(ApiMaker::UnknownSelectAttributeError) || unpermitted_parameters?(error) || invalid_search_term?(error)
  end

  def command_error_type(error)
    if error.is_a?(ApiMaker::IndividualCommand::NotFoundOrNoAccessError)
      :not_found_or_no_access
    elsif unpermitted_parameters?(error)
      :unpermitted_parameter
    elsif missing_parameter?(error)
      :missing_parameter
    elsif error.is_a?(ApiMaker::UnknownSelectAttributeError)
      :unknown_select_attribute
    elsif invalid_search_term?(error)
      :invalid_search_term
    else
      :runtime_error
    end
  end

  def command_error_message(error)
    if Rails.application.config.consider_all_requests_local
      "#{error.class.name}: #{error.message}"
    elsif unpermitted_parameters?(error)
      "This request included a parameter that is not allowed for this operation."
    elsif missing_parameter?(error)
      "This request was missing a required parameter: #{error.param}"
    elsif error.is_a?(ApiMaker::UnknownSelectAttributeError)
      # The resource + attribute name is the actionable signal for the
      # caller - keep it in the response instead of a generic message.
      error.message
    elsif invalid_search_term?(error)
      "This request used a search term that is not valid for this collection: #{invalid_search_term_name(error) || error.message}"
    else
      "Internal server error"
    end
  end

  # Client-side parameter errors are logged with request attribution instead of
  # being reported as application errors (no bug report). The counter keeps
  # repeated rejections observable; only attribution is logged, never a body.
  def log_missing_parameter_error(error, controller:)
    MISSING_PARAMETER_COUNTER_MUTEX.synchronize { MISSING_PARAMETER_COUNTER[:count] += 1 }

    request = controller.respond_to?(:request) ? controller.request : nil

    Rails.logger.warn(
      "api_maker_missing_command_parameter count=#{MISSING_PARAMETER_COUNTER[:count]} " \
      "path=#{request&.path.inspect} method=#{request&.request_method.inspect} " \
      "user_agent=#{request&.user_agent.to_s[0, 100].inspect} " \
      "param=#{error.param.inspect}"
    )
  end

  # Same shape as the missing-parameter log: an invalid search term is the
  # client's own payload, so it is logged with request attribution and a
  # counter instead of filing a bug report. Only the offending key is logged,
  # never the value it was paired with (search values can be personal data).
  def log_invalid_search_term_error(error, controller:)
    INVALID_SEARCH_TERM_COUNTER_MUTEX.synchronize { INVALID_SEARCH_TERM_COUNTER[:count] += 1 }

    request = controller.respond_to?(:request) ? controller.request : nil

    Rails.logger.warn(
      "api_maker_invalid_search_term count=#{INVALID_SEARCH_TERM_COUNTER[:count]} " \
      "path=#{request&.path.inspect} method=#{request&.request_method.inspect} " \
      "user_agent=#{request&.user_agent.to_s[0, 100].inspect} " \
      "search_term=#{invalid_search_term_name(error).inspect}"
    )
  end
end
