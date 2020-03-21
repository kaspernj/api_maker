require "rails_helper"

describe "model update with select" do
  let!(:account) { create :account, name: "Test account" }
  let(:user) { create :user }

  it "updates the model" do
    login_as user
    visit models_update_with_select_path(account)
    wait_for_selector ".content-container"
    wait_for_browser { find(".content-container")["data-name"] == "New name" }
  end
end
