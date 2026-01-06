require "rails_helper"

describe "utils - use breakpoint" do
  let(:user) { create :user }

  it "applies up styles from largest to smallest" do
    login_as user
    visit utils_use_breakpoint_path

    wait_for_selector "[data-testid='utils-use-breakpoint'][data-applied-background='red']"
  end
end
