class ApiMaker::CommandSpecHelper
  attr_reader :commands, :command_class, :collection

  def initialize(command:, collection: nil, controller: nil)
    @collection = collection
    @command_class = command
    @commands = {}
    @controller = controller || double
  end

  def add_command(args = {})
    id = commands.length + 1

    commands[id] = {
      args: args,
      id: id
    }

    AddedCommand.new(id, response)
  end

  def command
    @command ||= command_class.new(
      collection: collection,
      commands: commands,
      command_response: response,
      controller: controller
    )
  end

  def controller
    @controller ||= double(current_user: user)
  end

  def execute!
    command.execute!
  end

  def response
    @response ||= ApiMaker::CommandResponse.new
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
