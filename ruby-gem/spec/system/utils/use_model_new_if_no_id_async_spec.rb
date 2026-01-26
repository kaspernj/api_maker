require "rails_helper"

describe "utils - use model new if no id async" do
  let(:user) { create :user }

  it "renders a new model from async defaults only once" do
    login_as user
    visit utils_use_model_new_if_no_id_async_path

    expect(wait_for_and_find("[data-testid='utils-use-model-new-if-no-id-async']").text).to eq "Async default 1"
  end
end
