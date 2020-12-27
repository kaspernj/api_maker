class Commands::Tasks::TestCollection < Commands::ApplicationCommand
  def execute!
    command.result(test_collection_command_called: true)
  end
end
