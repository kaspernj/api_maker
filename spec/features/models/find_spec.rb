require "rails_helper"

describe "model find" do
  let!(:project) { create :project }

  it "finds the model", :js do
    visit models_find_path(project_id: project.id)

    puts page.html

    expect(current_path).to eq models_find_path
  end
end
