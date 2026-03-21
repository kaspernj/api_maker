require "rails_helper"

describe "utils - use model new if no id undefined query params" do
  let(:user) { create :user }

  it "renders a new model when query params are undefined" do
    login_as user
    visit utils_use_model_new_if_no_id_undefined_query_params_path

    expect(wait_for_and_find("[data-testid='utils-use-model-new-if-no-id-undefined-query-params']").text).to eq "Default task name"
  end
end
