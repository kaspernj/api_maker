require "rails_helper"

describe "model has many relationships" do
  let!(:project) { create :project }
  let!(:task_to_find) { create :task, project: project, user: user }
  let!(:task_not_to_find) { create :task, user: user }
  let(:user) { create :user }

  it "finds the sub models" do
    login_as user

    visit models_has_many_path(project_id: project.id)

    expect(current_path).to eq models_has_many_path

    wait_for_chrome { find("[data-controller='models--has-many']", visible: false)["data-has-many-completed"] == "true" }

    tasks_data = JSON.parse(find("[data-controller='models--has-many']", visible: false)["data-tasks"])

    expect(tasks_data).to eq [{"id" => task_to_find.id, "name" => task_to_find.name}]
  end
end
