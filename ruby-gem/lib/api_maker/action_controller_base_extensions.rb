ActionController::Base.__send__(:define_method, :api_maker_args) do
  @api_maker_args ||= {}
end

ActionController::Base.helper_method(:api_maker_args)

ActionController::Base.__send__(:define_method, :current_session_id) do
  ApiMaker::SessionShadowStore.session_id_for(request:)
end

ActionController::Base.helper_method(:current_session_id)
