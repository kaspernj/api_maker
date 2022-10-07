require "rails_helper"

describe "api maker table - anonymous access" do
  let(:task) { create :task, name: "Some readable task" }

  it "removes columns no longer found" do
    task

    visit bootstrap_live_table_path
    wait_for_selector model_row_selector(task)

    created_table_setting = ApiMakerTable::TableSetting.last!

    expect(created_table_setting).to have_attributes(
      identifier: "tasks-default",
      user_type: ""
    )
  end
end
