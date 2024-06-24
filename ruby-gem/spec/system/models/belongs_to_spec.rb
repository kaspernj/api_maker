require "rails_helper"

describe "model belongs to relationships" do
  let!(:project) { create :project }
  let!(:task) { create :task, project:, user: }
  let(:user) { create :user }

  it "finds the parent model" do
    login_as user
    visit models_belongs_to_path(task_id: task.id)
    wait_for_path models_belongs_to_path
    wait_for_browser { find("[data-controller='models--belongs-to']", visible: false)["data-belongs-to-completed"] == "true" }

    project_data = JSON.parse(find("[data-controller='models--belongs-to']", visible: false)["data-project"])
    expect(project_data).to eq("id" => project.id, "name" => project.name)
  end
end
