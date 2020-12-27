class Commands::Tasks::TestMember < Commands::ApplicationCommand
  def execute!
    succeed!(test_member_command_called: true)
  end
end
