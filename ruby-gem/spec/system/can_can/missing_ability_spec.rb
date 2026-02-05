require "rails_helper"

describe "can can - missing ability" do
  let(:user) { create :user }

  it "auto-loads a missing ability" do
    login_as user
    visit can_can_missing_ability_path

    wait_for_selector ".can-can-missing-ability[data-status='loading']"
    wait_for_selector ".can-can-missing-ability[data-status='loaded']"
  end
end
