class Commands::Tasks::FailureSaveResponse < Commands::ApplicationCommand
  alias task model

  def execute!
    task.update(params)

    raise "Model is valid" unless task.invalid?

    failure_save_response(model: task, params:, simple_model_errors: args.fetch(:simple_model_errors))
  end

  def params
    args.require(:task).permit(:name, project_attributes: [:account_id, :name])
  end
end
