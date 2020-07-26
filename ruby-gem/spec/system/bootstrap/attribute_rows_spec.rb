require "rails_helper"

describe "bootstrap attribute rows" do
  let(:user) { create :user }
  let(:user_kasper) { create :user, email: "kasper@example.com" }

  it "renders the page" do
    user
    user_kasper

    visit bootstrap_attribute_rows_path
    wait_for_selector ".user-row[data-user-id='#{user.id}']"

    binding.pry
  end
end
