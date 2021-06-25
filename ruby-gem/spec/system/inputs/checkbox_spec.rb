require "rails_helper"

describe "inputs - checkbox" do
  let(:project) { create :project, name: "test-project", public: false }
  let(:user) { create :user }

  describe "#auto_refresh" do
    it "automatically reflects changed through web socket events" do
      login_as user
      visit inputs_checkbox_path(auto_refresh: true, project_id: project.id)
      wait_for_selector "#project_public:not(:checked)[data-auto-refresh='true'][data-auto-submit='false']"
      wait_for_action_cable_to_connect

      project.update!(public: true)

      wait_for_selector "#project_public:checked[data-auto-refresh='true'][data-auto-submit='false']"
    end
  end

  describe "#auto_submit" do
    it "automatically submits when changed" do
      login_as user
      visit inputs_checkbox_path(auto_submit: true, project_id: project.id)
      wait_for_selector "#project_public:not(:checked)[data-auto-refresh='false'][data-auto-submit='true']"

      wait_for_and_find("#project_public").set(true)

      wait_for_expect { expect(project.reload).to have_attributes(public: true) }
    end
  end
end
