require "rails_helper"

describe "super admin - dashboard" do
  let(:user_admin) { create :user, admin: true, email: "admin@example.com", first_name: "Admin", last_name: "Adminson" }

  it "renders the page" do
    login_as user_admin
    visit super_admin_path

    # It shows menu items
    wait_for_selector "[data-class='components--admin--layout--menu--menu-item']", exact_text: "Projects"
    wait_for_selector "[data-class='components--admin--layout--menu--menu-item']", exact_text: "Tasks"

    # It shows the user who is signed in
    wait_for_selector "[data-class='menu-user-name-container']", exact_text: "Admin Adminson"
  end
end
