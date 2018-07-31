require "rails_helper"

describe "model find" do
  let!(:project) { create :project }
  let!(:task) { create :task, project: project }

  it "finds the model", :js do
    visit models_find_path(project_id: project.id)

    expect(current_path).to eq models_find_path

    WaitUtil.wait_for_condition("project element to appear") { find("[data-controller='models--find']", visible: false)["data-find-completed"] == "true" }

    project_data = JSON.parse(find("[data-controller='models--find']", visible: false)["data-project-data"])

    expect(project_data.fetch("modelData").fetch("name")).to eq project.name
    expect(project_data.fetch("modelData")).to_not have_key "tasks"
    expect(project_data.fetch("modelData")).to_not have_key "task"
  end
end
