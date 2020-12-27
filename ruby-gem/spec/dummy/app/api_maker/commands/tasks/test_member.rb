class Commands::Tasks::TestMember < Commands::ApplicationCommand
  def execute!
    command.result(test_member_command_called: true)
  end
end
