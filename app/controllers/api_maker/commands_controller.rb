class ApiMaker::CommandsController < ApiMaker::BaseController
  def create
    responses = {}

    params[:pool].each do |command_type, command_type_data|
      command_type_data.each do |model_plural_name, command_model_data|
        command_model_data.each do |command_name, command_data|
          if command_type == "collection"
            result = ApiMaker::CollectionCommandService.execute!(
              commands: command_data,
              command_name: command_name,
              model_name: model_plural_name,
              controller: self
            ).result
          elsif command_type == "index"
            result = ApiMaker::IndexCommandService.execute!(
              commands: command_data,
              model_name: model_plural_name,
              controller: self
            ).result
          elsif command_type == "member"
            result = ApiMaker::MemberCommandService.execute!(
              commands: command_data,
              command_name: command_name,
              model_name: model_plural_name,
              controller: self
            ).result
          else
            raise "Unknown type of command: #{command.fetch(:type)}"
          end

          responses.merge!(result)
        end
      end
    end

    render json: {responses: responses}
  end
end
