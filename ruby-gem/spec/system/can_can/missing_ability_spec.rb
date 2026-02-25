require "rails_helper"

describe "can can - missing ability" do
  let(:admin_user) { create :user, :admin }

  it "auto-loads a missing ability" do
    login_as admin_user
    visit can_can_missing_ability_path

    wait_for_selector ".can-can-missing-ability"

    wait_for_expect do
      expect(wait_for_and_find(".can-can-missing-ability")["data-status"]).to eq "loaded"
    end
  end
end
