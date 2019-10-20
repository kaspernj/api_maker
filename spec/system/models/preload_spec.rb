require "rails_helper"

describe "model preload" do
  let!(:task) { create :task, name: "test-task", project: project, user: user }
  let!(:project) { create :project, name: "test-project" }
  let(:user) { create :user }

  it "finds the model" do
    login_as user

    visit models_preload_path(task_id: task.id)

    expect(page).to have_current_path models_preload_path, ignore_query: true

    wait_for_chrome { find("[data-controller='models--preload']", visible: false)["data-preload-completed"] == "true" }

    task_with_preload = JSON.parse(find("[data-controller='models--preload']", visible: false)["data-task-with-preload"])
    task_without_preload = JSON.parse(find("[data-controller='models--preload']", visible: false)["data-task-without-preload"])

    expect(task_with_preload.fetch("modelData")).not_to have_key "project"
    expect(task_with_preload.dig("relationshipsCache", "project", "modelData", "name")).to eq "test-project"
    expect(task_without_preload.fetch("modelData")).not_to have_key "project"
  end
end
