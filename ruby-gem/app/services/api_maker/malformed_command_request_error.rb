class ApiMaker::MalformedCommandRequestError < StandardError
  # Raised when the command request payload violates the executor contract:
  # every level of the command pool, down to each individual command entry,
  # must be a Hash. The message names the offending path and the class that
  # was received, so the calling client can be identified and fixed.
end
