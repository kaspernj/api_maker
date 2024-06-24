require "rails_helper"

describe "models index distinct" do
  let!(:account) { create :account }
  let!(:account_market_task1) { create :account_marked_task, account:, task: }
  let!(:account_market_task2) { create :account_marked_task, account:, task: }
  let!(:project) { create :project, account: }
  let!(:task) { create :task, project:, user: }
  let!(:user) { create :user }

  it "reacts on destroy events" do
    login_as user

    visit models_index_distinct_path(account_id: account.id)

    wait_for_selector ".task-row[data-task-id='#{task.id}']"

    rows = all(".task-row")

    expect(rows.length).to eq 1
  end
end
