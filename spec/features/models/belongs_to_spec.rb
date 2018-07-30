require "rails_helper"

describe "model belongs to relationships" do
  let!(:project) { create :project }
  let!(:task) { create :task, project: project }

  it "finds the parent model", :js do
    visit models_belongs_to_path(task_id: task.id)

    expect(current_path).to eq models_belongs_to_path

    WaitUtil.wait_for_condition("model to be found") { find("[data-controller='models--belongs-to']", visible: false)["data-belongs-to-completed"] == "true" }

    ids = JSON.parse(find("[data-controller='models--belongs-to']", visible: false)["data-project"])

    expect(ids).to eq("id" => project.id, "name" => project.name)
  end
end
