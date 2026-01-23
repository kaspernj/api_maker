require "rails_helper"

describe "utils - link padding" do
  let(:user) { create :user }

  it "applies horizontal and vertical padding on web links" do
    login_as user
    visit utils_link_padding_path

    link = wait_for_and_find("[data-testid='utils-link-padding-link']")
    link_style = link[:style]

    expect(link_style).to include("padding-left: 12px")
    expect(link_style).to include("padding-right: 12px")
    expect(link_style).to include("padding-top: 8px")
    expect(link_style).to include("padding-bottom: 8px")
  end
end
