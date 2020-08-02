require "rails_helper"

describe "bootstrap attribute rows" do
  let(:user) { create :user }
  let(:user_kasper) { create :user, email: "kasper@example.com" }

  it "renders the page" do
    user
    user_kasper

    visit bootstrap_attribute_rows_path

    # Shouldn't crash because 'updated at' isn't loaded
    wait_for_browser { wait_for_and_find(".user-row[data-user-id='#{user.id}'] .updated-at-column td").text == "" }

    # Should show 'updated at' so it shouldn't be empty
    wait_for_browser { wait_for_and_find(".user-row[data-user-id='#{user_kasper.id}'] .updated-at-column td").text != "" }
  end
end
