class ModelsController < ApplicationController
  def accessible_by; end

  def belongs_to; end

  def create; end

  def destroy
    @project = Project.find(params[:project_id])
  end

  def find
    @project = Project.find(params[:project_id])
  end

  def has_many; end

  def has_one; end

  def preload; end

  def ransack; end

  def update
    @project = Project.find(params[:project_id])
    @project.update!(name: "not-renamed")
  end
end
