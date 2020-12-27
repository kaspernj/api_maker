class Commands::Tasks::TestCollection < Commands::ApplicationCommand
  def execute!
    succeed!(test_collection_command_called: true)
  end
end
