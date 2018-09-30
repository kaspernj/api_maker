class ApiMaker::TasksController < ApiMaker::ModelController
private

  def task_params
    params.require(:task).permit(:task)
  end
end
