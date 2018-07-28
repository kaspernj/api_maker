require "rails_helper"

describe "model find" do
  let!(:project) { create :project }

  it "finds the model", :js do
    visit models_find_path(project_id: project.id)

    expect(current_path).to eq models_find_path

    WaitUtil.wait_for_condition("project element to appear") { page.has_selector?(".project") }

    expect(find(".project")["data-project-name"]).to eq project.name
  end
end
