class ApiMaker::ProjectsController < ApiMaker::ModelController
private

  def project_params
    params.require(:project).permit(:name)
  end
end
