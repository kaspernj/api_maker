class ApiMaker::BaseCommand
  attr_reader :commands, :command_response, :collection, :controller

  delegate :current_user, :params, :signed_in?, to: :controller

  def initialize(collection:, commands:, command_response:, controller:)
    raise "No controller given" unless controller

    @collection = collection
    @commands = commands
    @command_response = command_response
    @controller = controller
  end

  def api_maker_args
    @api_maker_args ||= controller.__send__(:api_maker_args)
  end

  def current_ability
    @current_ability ||= controller.__send__(:current_ability)
  end

  def each_command
    @commands.each do |command_id, command_data|
      command = ApiMaker::IndividualCommand.new(
        args: command_data[:args],
        collection: @collection,
        id: command_id,
        primary_key: command_data[:primary_key],
        response: @command_response
      )
      yield command
    end
  end

  def result_for_command(id, data)
    @command_response.result_for_command(id, data)
  end
end
