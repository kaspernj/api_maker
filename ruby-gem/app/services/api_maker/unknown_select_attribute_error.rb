class ApiMaker::UnknownSelectAttributeError < RuntimeError
  # Raised when a select payload asks for an attribute the resource does not
  # expose. The payload itself is well-formed - the client and the API
  # disagree about the resource contract, and that disagreement is the signal
  # we must keep: the parser never skips or ignores the unknown attribute,
  # because a tolerant parser would silently return partial records to every
  # consumer.
  #
  # Base is RuntimeError so existing generic rescues keep catching it. It is a
  # client contract error, not a server fault, so the command endpoints answer
  # it as a 4xx naming the resource and the attribute instead of a 500 that
  # files a server-side bug report.
end
