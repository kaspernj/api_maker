class ModelsController < ApplicationController
  def find
    @project = Project.find(params[:project_id])
  end
end
