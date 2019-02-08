class ApiMaker::CommandsController < ApiMaker::BaseController
  def create
    return bundeled_command if params[:bundle]

    if params[:collection_command]
      authorize!(params[:collection_command].to_sym, klass)
    else
      ability_name = params[:member_command].to_sym
      model = klass.accessible_by(current_ability, ability_name).find(params[:id])
      raise CanCan::AccessDefined.new("Not authorized!", ability_name, klass) unless model
    end

    instance = constant.new(args: params[:args], controller: self, model: model)
    instance.execute!
  end

private

  def bundeled_command
    responses = []

    params[:bundle].each do |command|
      if command.fetch(:type) == "collection"
        responses += ApiMaker::CollectionCommandService.new(command: command)
      elsif command.fetch(:type == "member"
        responses += ApiMaker::MemberCommandService.new(command: command)
      else
        raise "Unknown type of command: #{command.fetch(:type)}"
      end
    end

    render json: {
      responses: responses
    }
  end
end
