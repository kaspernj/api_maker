require "rails_helper"

describe "super admin - dashboard" do
  let(:user_admin) { create :user, admin: true, email: "admin@example.com", first_name: "Admin", last_name: "Adminson" }

  it "renders the page" do
    login_as user_admin
    visit super_admin_path

    wait_for_selector "[data-component='super-admin--layout--menu']"

    # Wait for the signed-in user section before asserting model menu entries loaded via abilities.
    wait_for_selector "[data-class='menu-user-name-container']", exact_text: "Admin Adminson"

    # It shows menu items
    wait_for_selector "[data-class='components--admin--layout--menu--menu-item']", exact_text: "Projects"
    wait_for_selector "[data-class='components--admin--layout--menu--menu-item']", exact_text: "Tasks"
  end
end
