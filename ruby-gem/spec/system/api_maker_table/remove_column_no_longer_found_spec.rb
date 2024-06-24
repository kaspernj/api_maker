require "rails_helper"

describe "api maker table - remove column no longer found" do
  let(:table_setting) { create :table_setting, identifier: "tasks-default", user: }
  let(:table_setting_column_not_found) { create :table_setting_column, id: 99_982, identifier: "not-found", table_setting: }
  let(:task) { create :task }
  let(:user) { create :user, admin: true }

  it "removes columns no longer found" do
    table_setting
    table_setting_column_not_found
    task

    login_as user
    visit bootstrap_live_table_path
    wait_for_selector model_row_selector(task)

    wait_for_expect do
      expect { table_setting_column_not_found.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
