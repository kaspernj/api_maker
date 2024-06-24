require "rails_helper"

describe "models - has many as" do
  let(:admin) { create :user, :admin, id: 101 }
  let(:account) { create :account, id: 102 }
  let(:account_marked_task1) { create :account_marked_task, account:, task: task1 }
  let(:account_marked_task2) { create :account_marked_task, account:, task: task2 }
  let(:project) { create :project, account:, id: 103 }
  let(:task1) { create :task, project:, id: 104 }
  let(:task2) { create :task, project:, id: 105 }

  it "reads the models from the relationship" do
    account_marked_task1
    account_marked_task2

    login_as admin
    visit models_has_many_through_path(account_id: account.id)
    wait_for_selector ".task-container[data-task-id='#{task1.id}']"
    wait_for_selector ".task-container[data-task-id='#{task2.id}']"
  end
end
