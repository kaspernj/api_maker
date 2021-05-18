require "rails_helper"

describe "can can - loader" do
  let(:user) { create :user }

  it "reloads the abilities" do
    login_as user
    visit can_can_loader_path
    wait_for_selector ".can-access-admin"

    wait_for_and_find(".sign-out-button").click
    wait_for_and_find(".reset-abilities-button").click
    wait_for_selector ".cannot-access-admin"
  end
end
