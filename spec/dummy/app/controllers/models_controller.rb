class ModelsController < ApplicationController
  def destroy
    @project = Project.find(params[:project_id])
  end

  def find
    @project = Project.find(params[:project_id])
  end

  def update
    @project = Project.find(params[:project_id])
    @project.update!(name: "not-renamed")
  end
end
