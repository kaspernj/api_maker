class ApiMaker::UnknownCommandError < StandardError
  # Raised when a member/collection command name in a request pool does not
  # resolve to a command constant in the application. The command does not
  # exist, so the request is a client contract error: the executor rejects it
  # before running anything, the controller answers 400 naming the command,
  # and no server-side bug report is created.
end
