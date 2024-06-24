class Commands::Tasks::TestCollection < Commands::ApplicationCommand
  def execute!
    succeed!(
      api_maker_args:,
      test_collection_command_called: true
    )
  end
end
