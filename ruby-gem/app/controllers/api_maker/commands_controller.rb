class ApiMaker::CommandsController < ApiMaker::BaseController
  wrap_parameters false

  def create
    command_response = ApiMaker::CommandResponse.new(controller: self)
    controller = self

    merged_params.fetch(:pool).each do |command_type, command_type_data|
      command_type_data.each do |resource_plural_name, command_model_data|
        command_model_data.each do |command_name, command_data|
          ApiMaker.const_get("#{command_type.camelize}CommandService").execute!(
            ability: current_ability,
            api_maker_args:,
            command_response:,
            commands: command_data,
            command_name:,
            controller:,
            resource_name: resource_plural_name
          )
        end
      end
    end

    command_response.join_threads

    render json: {responses: command_response.result}
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
