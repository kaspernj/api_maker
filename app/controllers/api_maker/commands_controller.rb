class ApiMaker::CommandsController < ApiMaker::BaseController
  def create
    command_response = ApiMaker::CommandResponse.new(controller: self)
    controller = self

    params[:pool].each do |command_type, command_type_data|
      command_type_data.each do |resource_plural_name, command_model_data|
        command_model_data.each do |command_name, command_data|
          ApiMaker.const_get("#{command_type.camelize}CommandService").execute!(
            ability: current_ability,
            args: api_maker_args,
            command_response: command_response,
            commands: command_data,
            command_name: command_name,
            resource_name: resource_plural_name,
            controller: controller
          )
        end
      end
    end

    command_response.join_threads

    render json: {responses: command_response.result}
  end
end
