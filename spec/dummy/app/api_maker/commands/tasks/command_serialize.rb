class Commands::Tasks::CommandSerialize < Commands::ApplicationCommand
  def execute!
    each_command do |command|
      command.result(
        test: {
          task: Task.find(command.args.fetch(:task_id))
        }
      )
    end

    ServicePattern::Response.new(success: true)
  end
end
