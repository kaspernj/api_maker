require "rails_helper"

describe "model destroy" do
  let!(:project) { create :project }
  let(:user) { create :user }

  it "destroys the model" do
    login_as user

    visit models_destroy_path(project_id: project.id)

    expect(current_path).to eq models_destroy_path

    wait_for_chrome { find("[data-controller='models--destroy']", visible: false)["data-destroy-completed"] == "true" }

    expect { project.reload }.to raise_error(ActiveRecord::RecordNotFound)
  end
end
