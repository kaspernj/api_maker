require "rails_helper"

describe "utils - link padding" do
  let(:user) { create :user }

  it "applies horizontal and vertical padding on web links" do
    login_as user
    visit utils_link_padding_path

    link = wait_for_and_find("[data-testid='utils-link-padding-link']")
    link_style = link[:style]

    expect(link_style).to include("padding: 8px 12px")
  end
end
