class ApiMaker::CollectionCommandService < ApiMaker::ApplicationService
  def initialize(command:, controller:)
    @ability = controller.current_ability
    @command = command
  end

  def execute!
    authorize!

    command_response = ApiMaker::CommandResponse.new

    instance = constant.new(args: params[:args], model: model, response: command_response)
    instance.execute!
  end

  def authorize!
    @ability.authorize!(params[:collection_command].to_sym, klass)
  end

  def command_name
    @command_name ||= @command.fetch(:name)
  end

  def constant
    @constant ||= proc do
      command = params[:collection_command]&.camelize || params[:member_command].camelize
      "Commands::#{namespace}::#{command}".constantize
    end.call
  end

  def namespace
    @namespace ||= params[:plural_name].camelize
  end

  def klass
    @klass ||= params[:plural_name].singularize.camelize.constantize
  end
end
