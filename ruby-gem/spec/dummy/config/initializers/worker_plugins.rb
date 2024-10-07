Rails.configuration.to_prepare do
  WorkerPlugins::Workplace.class_eval do
    include ApiMaker::ModelExtensions
  end

  WorkerPlugins::WorkplaceLink.class_eval do
    include AllRansackable
  end
end
