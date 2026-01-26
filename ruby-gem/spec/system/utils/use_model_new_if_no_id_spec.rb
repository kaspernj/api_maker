require "rails_helper"

describe "utils - use model new if no id" do
  let(:user) { create :user }

  it "renders a new model from synchronous defaults" do
    login_as user
    visit utils_use_model_new_if_no_id_path

    expect(wait_for_and_find("[data-testid='utils-use-model-new-if-no-id']").text).to eq "Default task name"
  end
end
