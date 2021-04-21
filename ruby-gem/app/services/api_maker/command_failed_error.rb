class ApiMaker::CommandFailedError < RuntimeError
  attr_accessor :api_maker_errors
end
