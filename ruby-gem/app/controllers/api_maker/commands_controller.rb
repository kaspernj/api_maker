class ApiMaker::CommandsController < ApiMaker::BaseController
  def create
    command_response = ApiMaker::CommandResponse.new(controller: self)
    controller = self

    pool_params.fetch(:pool).each do |command_type, command_type_data|
      command_type_data.each do |resource_plural_name, command_model_data|
        command_model_data.each do |command_name, command_data|
          ApiMaker.const_get("#{command_type.camelize}CommandService").execute!(
            ability: current_ability,
            args: api_maker_args,
            command_response: command_response,
            commands: command_data,
            command_name: command_name,
            controller: controller,
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

  def raw_params
    @raw_params ||= params[:raw]
  end

  def pool_params
    @pool_params ||= if json_data && raw_params
      raw_data = raw_params.permit!.to_h
      merged_data = json_data.deep_merge(raw_data)
      ActionController::Parameters.new(merged_data)
    elsif json_params
      json_params
    elsif raw_params
      raw_params
    end
  end
end
