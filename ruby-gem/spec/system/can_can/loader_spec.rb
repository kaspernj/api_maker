require "rails_helper"

describe "can can - loader" do
  let(:user) { create :user }

  let(:can_access_admin_selector) { ".can-access-admin" }
  let(:cannot_access_admin_selector) { ".cannot-access-admin" }

  it "reloads the abilities" do
    login_as user
    visit can_can_loader_path

    wait_for_selector ".components-can-can-loader-with-shape #{can_access_admin_selector}"
    wait_for_selector ".components-can-can-loader-with-state #{can_access_admin_selector}"
    wait_for_no_selector ".components-can-can-loader-with-shape #{cannot_access_admin_selector}"
    wait_for_no_selector ".components-can-can-loader-with-state #{cannot_access_admin_selector}"

    wait_for_and_find(".sign-out-button").click
    wait_for_and_find(".reset-abilities-button").click

    wait_for_selector ".components-can-can-loader-with-shape #{cannot_access_admin_selector}"
    wait_for_selector ".components-can-can-loader-with-state #{cannot_access_admin_selector}"
    wait_for_no_selector ".components-can-can-loader-with-shape #{can_access_admin_selector}"
    wait_for_no_selector ".components-can-can-loader-with-state #{can_access_admin_selector}"
  end

  it "calls the abilities callbacks in the correct order" do
    login_as user
    visit can_can_loader_path
    wait_for_and_find(".load-reset-load-button").click
    wait_for_selector ".additional-loader-with-state #{cannot_access_admin_selector}"
  end
end
