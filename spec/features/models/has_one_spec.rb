require "rails_helper"

describe "model belongs to relationships" do
  let!(:project) { create :project }
  let!(:task) { create :task, project: project }

  it "finds the parent model", :js do
    visit models_has_one_path(project_id: project.id)

    expect(current_path).to eq models_has_one_path

    wait_for_chrome { find("[data-controller='models--has-one']", visible: false)["data-has-one-completed"] == "true" }

    task_data = JSON.parse(find("[data-controller='models--has-one']", visible: false)["data-task"])

    expect(task_data).to eq("id" => task.id, "name" => task.name)
  end
end
