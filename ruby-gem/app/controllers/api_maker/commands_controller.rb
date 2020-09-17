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
    @json_params ||= begin
      return if params[:json].blank?

      json_params = JSON.parse(params[:json])
      controller_params = ActionController::Parameters.new(json_params)

      {result: controller_params}
    end

    @json_params.fetch(:result)
  end

  def raw_params
    @raw_params ||= params[:raw]
  end

  def pool_params
    @pool ||= if json_params && raw_params
      json_params.deep_merge(raw_params)
    elsif json_params
      json_params
    elsif raw_params
      raw_params
    end
  end
end
