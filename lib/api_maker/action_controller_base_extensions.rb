ActionController::Base.__send__(:define_method, :api_maker_args) do
  @api_maker_args ||= {}
end

ActionController::Base.helper_method(:api_maker_args)
