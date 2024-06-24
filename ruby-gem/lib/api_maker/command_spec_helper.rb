class ApiMaker::CommandSpecHelper
  attr_reader :commands, :command_class, :collection

  def initialize(command:, collection: nil, controller: nil)
    @collection = collection
    @command_class = command
    @commands = {}
    @controller = controller || double
  end

  def add_command(args: {}, primary_key: nil)
    id = commands.length + 1

    commands[id] = {
      args: ActionController::Parameters.new(args),
      id:,
      primary_key:
    }

    AddedCommand.new(id, response)
  end

  def command
    @command ||= begin
      raise "No commands have been added" if commands.empty?

      command_id = commands.keys.first
      command_data = commands.values.first

      individual_command = ApiMaker::IndividualCommand.new(
        args: ApiMaker::Deserializer.execute!(arg: command_data[:args]),
        collection:,
        command: self,
        id: command_id,
        primary_key: command_data[:primary_key],
        response:
      )

      command_class.new(
        ability: controller.__send__(:current_ability),
        api_maker_args: controller.__send__(:api_maker_args),
        collection:,
        collection_instance:,
        command: individual_command,
        commands:,
        command_response: response,
        controller:
      )
    end
  end

  def collection_instance
    @collection_instance ||= if command_class.const_defined?(:CollectionInstance)
      command_class.const_get(:CollectionInstance).new(
        ability: controller.__send__(:current_ability),
        api_maker_args: controller.__send__(:api_maker_args),
        collection:,
        commands:,
        command_response: response,
        controller:
      )
    end
  end

  def controller
    @controller ||= instance_double(ApplicationController, current_user: user)
  end

  def execute!
    command.execute_with_response
  end

  def response
    @response ||= ApiMaker::CommandResponse.new(controller: @controller)
  end

  class AddedCommand
    def initialize(id, response)
      @id = id
      @response = response
    end

    def result
      @result ||= @response.result.fetch(@id).fetch(:data)
    end
  end
end
