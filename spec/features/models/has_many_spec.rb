require "rails_helper"

describe "model has many relationships" do
  let!(:project) { create :project }
  let!(:task_to_find) { create :task, project: project }
  let!(:task_not_to_find) { create :task }

  it "finds the sub models", :js do
    visit models_has_many_path(project_id: project.id)

    expect(current_path).to eq models_has_many_path

    wait_for_chrome { find("[data-controller='models--has-many']", visible: false)["data-has-many-completed"] == "true" }

    ids = JSON.parse(find("[data-controller='models--has-many']", visible: false)["data-tasks"])

    expect(ids).to eq [{"id" => task_to_find.id, "name" => task_to_find.name}]
  end
end
