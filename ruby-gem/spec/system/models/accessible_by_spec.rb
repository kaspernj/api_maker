require "rails_helper"

describe "model accessible by" do
  let!(:project) { create :project }
  let!(:task) { create :task, id: 3, project:, user: }
  let!(:another_task) { create :task, project:, user: }
  let!(:user) { create :user }

  it "finds the parent model" do
    login_as user
    visit models_accessible_by_path
    wait_for_path models_accessible_by_path
    wait_for_selector "[data-controller='models--accessible-by'][data-accessible-by-completed='true']", visible: false

    project_data = JSON.parse(find("[data-controller='models--accessible-by']", visible: false)["data-result"])

    expect(project_data).to eq [{"id" => task.id, "name" => task.name}]
  end
end
