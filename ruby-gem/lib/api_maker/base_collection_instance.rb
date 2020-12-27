class ApiMaker::BaseCollectionInstance
  attr_reader :api_maker_args, :commands, :command_response, :collection, :controller, :current_ability

  def initialize(ability:, args:, collection:, commands:, command_response:, controller:)
    @api_maker_args = args
    @current_ability = ability
    @collection = collection
    @commands = commands
    @command_response = command_response
    @controller = controller

    # Make it possible to do custom preloads (useful in threadded mode that doesnt support Goldiloader)
    @collection = custom_collection(@collection) if respond_to?(:custom_collection)
  end
end
