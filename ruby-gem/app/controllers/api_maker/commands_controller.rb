class ApiMaker::CommandsController < ApiMaker::BaseController
  wrap_parameters false

  # Malformed command payloads are client errors: answer 400 with the
  # offending path/class instead of letting the executor crash with a 500
  # (which would also create a bug report). The executor already logged the
  # redacted snippet and bumped the rejection counter.
  rescue_from ApiMaker::MalformedCommandRequestError, with: :render_malformed_command_request
  # Unknown command names are client contract errors: answer 400 naming the
  # command instead of letting the constant lookup crash with a 500 NameError
  # (which would also file a bug report). The executor already logged the
  # rejection and bumped the counter.
  rescue_from ApiMaker::UnknownCommandError, with: :render_unknown_command

  def create
    render json: ApiMaker::CommandRequestExecutor.execute!(controller: self, payload: merged_params.permit!.to_h)
  end

private

  def render_malformed_command_request(error)
    render json: {errors: [{message: error.message, type: :malformed_command_request}], success: false}, status: :bad_request
  end

  def json_params
    @json_params ||= ActionController::Parameters.new(json_data) if json_data
  end

  def json_data
    @json_data ||= JSON.parse(params[:json]) if params[:json]
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

  def render_unknown_command(error)
    render json: {errors: [{message: error.message, type: :unknown_command}], success: false}, status: :bad_request
  end
end
