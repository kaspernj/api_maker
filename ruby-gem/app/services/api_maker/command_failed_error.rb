class ApiMaker::CommandFailedError < RuntimeError
  attr_accessor :api_maker_args, :api_maker_block
end
