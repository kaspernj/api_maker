class Commands::Tasks::TestMember < Commands::ApplicationCommand
  def execute!
    each_command do |command|
      command.result(test_member_command_called: true)
    end
  end
end
