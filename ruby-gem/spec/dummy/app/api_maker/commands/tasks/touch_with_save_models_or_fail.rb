class Commands::Tasks::TouchWithSaveModelsOrFail < Commands::ApplicationCommand
  def execute!
    task = model
    task.created_at = "1985-06-17 10:30"

    save_models_or_fail task
  end
end
