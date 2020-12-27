class Commands::Tasks::CommandSerialize < Commands::ApplicationCommand
  def execute!
    succeed!(
      test: {
        task: Task.find(command.args.fetch(:task_id))
      }
    )
  end
end
