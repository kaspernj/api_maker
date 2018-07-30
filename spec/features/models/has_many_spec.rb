require "rails_helper"

describe "model update" do
  let!(:project) { create :project }
  let!(:task_to_find) { create :task, project: project }
  let!(:task_not_to_find) { create :task }

  it "updates the model", :js do
    visit models_has_many_path(project_id: project.id)

    expect(current_path).to eq models_has_many_path

    WaitUtil.wait_for_condition("project to be updated") { find("[data-controller='models--has-many']", visible: false)["data-has-many-completed"] == "true" }

    ids = JSON.parse(find("[data-controller='models--has-many']", visible: false)["data-tasks"])

    expect(ids).to eq [{"id" => task_to_find.id, "name" => task_to_find.name}]
  end
end
