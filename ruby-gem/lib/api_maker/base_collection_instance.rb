class ApiMaker::BaseCollectionInstance
  ApiMaker::IncludeHelpers.execute!(klass: self)

  attr_accessor :collection
  attr_reader :api_maker_args, :commands, :command_response, :controller, :current_ability

  def initialize(ability:, args:, collection:, commands:, command_response:, controller:)
    @api_maker_args = args
    @current_ability = ability
    @collection = collection
    @commands = commands
    @command_response = command_response
    @controller = controller
  end
end
