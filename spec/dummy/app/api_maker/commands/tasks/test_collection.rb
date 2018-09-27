class Commands::Tasks::TestCollection < Commands::ApplicationCommand
  def execute!
    controller.render json: {
      test_collection_command_called: true
    }
  end
end
