require "rails_helper"

describe "can can - loader" do
  let(:user) { create :user }
  let(:admin_user) { create :user, :admin, email: "admin@example.com", password: "password", password_confirmation: "password" }

  let(:can_access_admin_selector) { ".can-access-admin" }
  let(:cannot_access_admin_selector) { ".cannot-access-admin" }

  it "reloads the abilities" do
    login_as user
    visit can_can_loader_path

    wait_for_selector ".components-can-can-loader-with-state #{can_access_admin_selector}"
    wait_for_no_selector ".components-can-can-loader-with-state #{cannot_access_admin_selector}"

    wait_for_and_find(".sign-out-button").click
    wait_for_and_find(".reset-abilities-button").click

    wait_for_selector ".components-can-can-loader-with-state #{cannot_access_admin_selector}"
    wait_for_no_selector ".components-can-can-loader-with-state #{can_access_admin_selector}"
  end

  it "reloads abilities after signing in" do
    admin_user
    visit can_can_loader_path

    wait_for_selector ".components-can-can-loader-with-state #{cannot_access_admin_selector}"
    wait_for_and_find("[data-testid='sign-in-as-admin']").click

    wait_for_selector ".components-can-can-loader-with-state #{can_access_admin_selector}"
    wait_for_no_selector ".components-can-can-loader-with-state #{cannot_access_admin_selector}"
  end

  it "calls the abilities callbacks in the correct order" do
    login_as user
    visit can_can_loader_path
    wait_for_selector ".components-can-can-loader-with-state #{can_access_admin_selector}"
    wait_for_and_find(".show-loader-that-signs-out-on-load-button").click
    wait_for_selector cannot_access_admin_selector
  end

  it "updates the cache key when abilities reset" do
    login_as user
    visit can_can_loader_path
    wait_for_selector ".components-can-can-loader-with-state #{can_access_admin_selector}"

    cache_key_selector = ".components-can-can-loader-with-state [data-class='can-can-cache-key']"
    initial_cache_key = wait_for_and_find(cache_key_selector).text.to_i

    wait_for_and_find(".reset-abilities-button").click

    wait_for_expect do
      expect(wait_for_and_find(cache_key_selector).text.to_i).to be > initial_cache_key
    end
  end
end
