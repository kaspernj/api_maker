class ApiMaker::MemberCommandService < ApiMaker::ApplicationService
  def initialize(command:, command_name:, model_name:, controller:)
    @ability = controller.__send__(:current_ability)
    @command_name = command_name
    @command = command
    @model_name = model_name
  end

  def execute!
    command_response = ApiMaker::CommandResponse.new

    @command.each do |command_id, command_data|
      ability_name = params[:member_command].to_sym
      model = klass.accessible_by(current_ability, ability_name).find(params[:id])
      raise CanCan::AccessDefined.new("Not authorized!", ability_name, klass) unless model

      instance = constant.new(args: params[:args], controller: self, model: model)
      instance.execute!
    end

    ServicePattern::Response.new(result: command_response.result)
  end
end
