require "rails_helper"

describe "inputs - string" do
  let(:project) { create :project, name: "test-project" }
  let(:user) { create :user }

  describe "#auto_refresh" do
    it "automatically reflects changed through web socket events" do
      login_as user
      visit inputs_string_path(auto_refresh: true, project_id: project.id)
      wait_for_selector "#project_name[value='test-project']"
      wait_for_action_cable_to_connect

      project.update!(name: "updated-project")

      wait_for_selector "#project_name[value='updated-project']"
    end
  end
end
