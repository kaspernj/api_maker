class ApiMaker::CommandsController < ApiMaker::BaseController
  wrap_parameters false

  # A select for an attribute the resource does not expose is a client
  # contract error: answer 400 naming the resource and the attribute instead
  # of a 500 RuntimeError (which would also file a bug report). The executor
  # already logged the rejection and the parser bumped the counter.
  rescue_from ApiMaker::UnknownSelectAttributeError, with: :render_unknown_select_attribute

  def create
    render json: ApiMaker::CommandRequestExecutor.execute!(controller: self, payload: merged_params.permit!.to_h)
  end

  def json_params
    @json_params ||= ActionController::Parameters.new(json_data) if json_data
  end

  def json_data
    @json_data ||= JSON.parse(params[:json]) if params[:json]
  end

  def render_unknown_select_attribute(error)
    render json: {errors: [{message: error.message, type: :unknown_select_attribute}], success: false}, status: :bad_request
  end

  def merged_params
    @merged_params ||= if json_data
      raw_data = params.permit!.to_h
      merged_data = ApiMaker::DeepMergeParams.execute!(json_data, raw_data)
      ActionController::Parameters.new(merged_data)
    elsif json_params
      json_params
    else
      params
    end
  end
end
