class Commands::Tasks::TestCollection < Commands::ApplicationCommand
  def execute
    each_command do |command|
      command.result(test_collection_command_called: true)
    end
  end
end
