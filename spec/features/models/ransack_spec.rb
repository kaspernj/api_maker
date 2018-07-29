require "rails_helper"

describe "model ransack" do
  let!(:project_to_find) { create :project, name: "ransack" }
  let!(:project_not_to_find) { create :project, name: "kasper" }

  it "finds the model", :js do
    visit models_ransack_path

    expect(current_path).to eq models_ransack_path

    WaitUtil.wait_for_condition("ransack to complete") { puts page.html; puts chrome_logs; find("[data-controller='models--ransack']", visible: false)["data-ransack-completed"] == "true" }

    ids = JSON.parse(find("[data-controller='models--ransack']", visible: false).text)

    expect(ids).to eq [project_to_find.id]
  end
end
