class Services::DeviseEventsUpdateTask < ApiMaker::BaseService
  def perform
    task = Task.find(args.fetch(:task_id))
    task.update!(name: args.fetch(:name))

    succeed!(name: task.name)
  end
end
