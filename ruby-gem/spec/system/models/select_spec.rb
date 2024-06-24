require "rails_helper"

describe "models select" do
  let!(:task) { create :task, id: 29, name: "Test task", user: }
  let!(:user) { create :user }

  it "only gets the defined attributes" do
    login_as user

    visit models_select_path

    wait_for_selector ".component-models-select .content-container"

    result = JSON.parse(find(".content-container").text)
    model_data = result.dig!(0, "modelData")

    expect(model_data).to have_key "id"
    expect(model_data).to have_key "name"
    expect(model_data).not_to have_key "created_at"
    expect(model_data).not_to have_key "project_id"
    expect(model_data).not_to have_key "user_id"
    expect(model_data).not_to have_key "custom_id"
  end
end
