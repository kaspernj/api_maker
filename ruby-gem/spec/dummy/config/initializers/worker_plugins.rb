Rails.configuration.to_prepare do
  WorkerPlugins::Workplace.class_eval do
    include ApiMaker::ModelExtensions
  end
end
