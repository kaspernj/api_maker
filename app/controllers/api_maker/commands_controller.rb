class ApiMaker::CommandsController < ApiMaker::BaseController
  def create
    responses = {}

    params[:pool].each do |command_type, command_type_data|
      command_type_data.each do |model_plural_name, command_model_data|
        command_model_data.each do |command_name, command_data|
          result = ApiMaker.const_get("#{command_type.camelize}CommandService").execute!(
            commands: command_data,
            command_name: command_name,
            model_name: model_plural_name,
            controller: self
          ).result

          responses.merge!(result)
        end
      end
    end

    render json: {responses: responses}
  end
end
