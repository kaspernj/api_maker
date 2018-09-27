class Commands::Tasks::TestMember < Commands::ApplicationCommand
  def execute!
    controller.render json: {
      test_member_command_called: true
    }
  end
end
