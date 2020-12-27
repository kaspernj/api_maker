class Commands::Tasks::CommandSerialize < Commands::ApplicationCommand
  def execute!
    command.result(
      test: {
        task: Task.find(command.args.fetch(:task_id))
      }
    )
  end
end
