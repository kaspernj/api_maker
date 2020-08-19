require "rails_helper"

describe "model belongs to relationships" do
  let(:project) { create :project }
  let(:user) { create :user }

  it "finds the correct polymorphic model if present" do
    polymorphic_model = create :polymorphic_model, resource: project

    login_as user

    visit models_has_one_polymorphic_path(project_id: project.id)

    wait_for_browser { find("[data-controller='models--has-one-polymorphic']", visible: false)["data-has-one-completed"] == "true" }

    polymorphic_model_id = find("[data-controller='models--has-one-polymorphic']", visible: false)["data-polymorphic-model-id"]

    expect(polymorphic_model_id).to eq polymorphic_model.id
  end

  it "it doesn't return a polymorphic model if non existing" do
    project = create :project, id: 29
    user = create :user, id: 29
    polymorphic_model = create :polymorphic_model, resource: user

    login_as user

    visit models_has_one_polymorphic_path(project_id: project.id)

    wait_for_browser { find("[data-controller='models--has-one-polymorphic']", visible: false)["data-has-one-completed"] == "true" }

    polymorphic_model_id = find("[data-controller='models--has-one-polymorphic']", visible: false)["data-polymorphic-model-id"]

    expect(polymorphic_model_id).to eq ""
  end
end
