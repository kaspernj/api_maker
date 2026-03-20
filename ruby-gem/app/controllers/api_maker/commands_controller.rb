class ApiMaker::CommandsController < ApiMaker::BaseController
  wrap_parameters false

  def create
    render json: ApiMaker::CommandRequestExecutor.execute!(controller: self, payload: merged_params.permit!.to_h)
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
end
