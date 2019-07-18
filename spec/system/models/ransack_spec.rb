require "rails_helper"

describe "model ransack" do
  let!(:project_to_find) { create :project, name: "test-ransack-kasper" }
  let!(:project_not_to_find) { create :project, name: "kasper" }
  let!(:sub_task) { create :task, name: "test-project-task", project: project_to_find, user: user }
  let(:user) { create :user }

  it "finds the model" do
    login_as user

    visit models_ransack_path

    expect(current_path).to eq models_ransack_path

    wait_for_chrome { find("[data-controller='models--ransack']", visible: false)["data-ransack-completed"] == "true" }

    projects_without_preload = JSON.parse(find("[data-controller='models--ransack']", visible: false)["data-projects-without-preload"])
    projects_with_preload = JSON.parse(find("[data-controller='models--ransack']", visible: false)["data-projects-with-preload"])

    expect(projects_without_preload.fetch(0).fetch("modelData").fetch("name")).to eq "test-ransack-kasper"
    expect(projects_without_preload.fetch(0).fetch("relationshipsCache")).to eq({})
    expect(projects_without_preload.fetch(0).fetch("modelData")).to_not have_key "tasks"
    expect(projects_without_preload.fetch(0).fetch("modelData")).to_not have_key "updated_at"

    expect(projects_with_preload.fetch(0).fetch("modelData")).to_not have_key "tasks"
    expect(projects_with_preload.fetch(0).fetch("relationshipsCache").fetch("tasks").fetch(0).fetch("modelData").fetch("name")).to eq "test-project-task"
    expect(projects_with_preload.fetch(0).fetch("relationshipsCache").fetch("tasks").fetch(0).fetch("modelData")).to_not have_key "updated_at"
    expect(projects_with_preload.fetch(0).fetch("modelData").fetch("name")).to eq "test-ransack-kasper"
    expect(projects_with_preload.fetch(0).fetch("modelData")).to_not have_key "tasks"
    expect(projects_with_preload.fetch(0).fetch("modelData")).to_not have_key "updated_at"
  end
end
