require "rails_helper"

describe "utils - checkbox" do
  let(:user) { create :user }

  it "toggles when uncontrolled" do
    login_as user
    visit utils_checkbox_path

    wait_for_selector "[data-testid='utils-checkbox-uncontrolled'][data-checked='false']"
    wait_for_and_find("[data-testid='utils-checkbox-uncontrolled']").click
    wait_for_selector "[data-testid='utils-checkbox-uncontrolled'][data-checked='true']"
  end
end
