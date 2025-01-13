require "rails_helper"

describe "bootstrap attribute rows" do
  let(:user) { create :user }
  let(:user_kasper) { create :user, email: "kasper@example.com" }

  it "renders the page" do
    user
    user_kasper

    visit bootstrap_attribute_rows_path

    # Shouldn't crash because 'updated at' isn't loaded
    wait_for_expect do
      expect(wait_for_and_find(".user-row[data-user-id='#{user.id}'] .updated-at-column [data-class='attribute-row-value']", visible: false).text).to eq ""
    end

    # Should show 'updated at' so it shouldn't be empty
    wait_for_expect do
      expect(wait_for_and_find(".user-row[data-user-id='#{user_kasper.id}'] .updated-at-column [data-class='attribute-row-value']", visible: false).text).not_to eq ""
    end
  end
end
