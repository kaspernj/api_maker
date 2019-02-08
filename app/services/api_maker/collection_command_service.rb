class ApiMaker::CollectionCommandService < ApiMaker::ApplicationService
  def initialize(command:, command_name:, model_name:, controller:)
    @ability = controller.__send__(:current_ability)
    @command_name = command_name
    @command = command
    @model_name = model_name
  end

  def execute!
    puts "COMMAND: #{@command}"

    authorize!

    command_response = ApiMaker::CommandResponse.new

    @command.each do |command_id, command_data|
      instance = constant.new(args: command_data, model: model, response: command_response)
      instance.execute!
    end

    ServicePattern::Response.new(result: command_response.result)
  end

  def authorize!
    @ability.authorize!(@command_name.to_sym, klass)
  end

  def collection
    klass.where(klass.primary_key => @command.fetch(:ids))
  end

  def command_name
    @command_name ||= @command.fetch(:name)
  end

  def constant
    @constant ||= proc do
      "Commands::#{namespace}::#{@command_name.camelize}".constantize
    end.call
  end

  def namespace
    @namespace ||= @model_name.camelize
  end

  def klass
    @klass ||= @model_name.singularize.camelize.constantize
  end
end
