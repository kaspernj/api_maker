require "rails_helper"

describe "model find" do
  let!(:project) { create :project }
  let!(:task) { create :task, project: }
  let(:user) { create :user }

  it "finds the model" do
    login_as user

    visit models_find_path(project_id: project.id)

    wait_for_path models_find_path

    wait_for_browser { find("[data-controller='models--find']", visible: false)["data-find-completed"] == "true" }

    project_data = JSON.parse(find("[data-controller='models--find']", visible: false)["data-project-data"])

    expect(project_data.dig!("modelData", "name")).to eq project.name
    expect(project_data.fetch("modelData")).not_to have_key "tasks"
    expect(project_data.fetch("modelData")).not_to have_key "task"
    expect(project_data.fetch("modelData")).not_to have_key "updated_at"
  end
end
