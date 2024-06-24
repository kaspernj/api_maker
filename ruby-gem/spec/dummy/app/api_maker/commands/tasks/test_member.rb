class Commands::Tasks::TestMember < Commands::ApplicationCommand
  def execute!
    succeed!(
      api_maker_args:,
      test_member_command_called: true
    )
  end
end
