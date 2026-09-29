# Maps a raised command error onto the (error_type, message) pair that
# ApiMaker::BaseCommand surfaces to the client in its command response.
# Included into ApiMaker::BaseCommand's singleton so these read as ordinary
# class methods there.
module ApiMaker::CommandError
  def unpermitted_parameters?(error)
    error.is_a?(ActionController::UnpermittedParameters)
  end

  # Unpermitted parameters are a client-input problem, not a server bug: the
  # resource deliberately rejected a parameter. Surface them as a dedicated,
  # non-500 error type with a human-readable message instead of lumping them
  # in as "Internal server error" (:runtime_error).
  def command_error_type(error)
    if error.is_a?(ApiMaker::IndividualCommand::NotFoundOrNoAccessError)
      :not_found_or_no_access
    elsif unpermitted_parameters?(error)
      :unpermitted_parameter
    else
      :runtime_error
    end
  end

  def command_error_message(error)
    if Rails.application.config.consider_all_requests_local
      "#{error.class.name}: #{error.message}"
    elsif unpermitted_parameters?(error)
      "This request included a parameter that is not allowed for this operation."
    else
      "Internal server error"
    end
  end
end
