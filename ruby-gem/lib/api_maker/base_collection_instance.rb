class ApiMaker::BaseCollectionInstance
  ApiMaker::IncludeHelpers.execute!(klass: self)

  attr_accessor :collection
  attr_reader :api_maker_args, :commands, :command_response, :controller, :current_ability

  def initialize(ability:, api_maker_args:, collection:, commands:, command_response:, controller:)
    @api_maker_args = api_maker_args
    @current_ability = ability
    @collection = collection
    @commands = commands
    @command_response = command_response
    @controller = controller
  end
end
