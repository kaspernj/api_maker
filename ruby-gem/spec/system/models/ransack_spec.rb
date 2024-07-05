require "rails_helper"

describe "model ransack" do
  let!(:project_to_find) { create :project, name: "test-ransack-kasper" }
  let!(:project_not_to_find) { create :project, name: "kasper" }
  let!(:sub_task) { create :task, name: "test-project-task", project: project_to_find, user: }
  let(:user) { create :user }

  it "finds the model" do
    login_as user

    visit models_ransack_path

    wait_for_path models_ransack_path

    wait_for_browser { find("[data-controller='models--ransack']", visible: false)["data-ransack-completed"] == "true" }

    projects_without_preload = JSON.parse(find("[data-controller='models--ransack']", visible: false)["data-projects-without-preload"])
    projects_with_preload = JSON.parse(find("[data-controller='models--ransack']", visible: false)["data-projects-with-preload"])

    expect(projects_without_preload.dig!(0, "modelData", "name")).to eq "test-ransack-kasper"
    expect(projects_without_preload.dig!(0, "relationshipsCache")).to eq({})
    expect(projects_without_preload.dig!(0, "modelData")).not_to have_key "tasks"
    expect(projects_without_preload.dig!(0, "modelData")).not_to have_key "updated_at"

    expect(projects_with_preload.dig!(0, "modelData")).not_to have_key "tasks"
    expect(projects_with_preload.dig!(0, "relationshipsCache", "tasks", 0, "modelData", "name")).to eq "test-project-task"
    expect(projects_with_preload.dig!(0, "relationshipsCache", "tasks", 0, "modelData")).not_to have_key "updated_at"
    expect(projects_with_preload.dig!(0, "modelData", "name")).to eq "test-ransack-kasper"
    expect(projects_with_preload.dig!(0, "modelData")).not_to have_key "tasks"
    expect(projects_with_preload.dig!(0, "modelData")).not_to have_key "updated_at"
  end
end
