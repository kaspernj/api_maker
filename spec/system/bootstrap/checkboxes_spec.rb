require "rails_helper"

describe "bootstrap - checkboxes" do
  let(:account) { create :account }
  let(:account_market_task1) { create :account_marked_task, account: account, task: task1 }
  let(:task1) { create :task }
  let(:task2) { create :task }
  let(:user) { create :user }

  it "deletes the last relationship" do
    login_as user

    visit bootstrap_checkbox_boolean_path(account_id: account.id)

    puts pretty_html
  end
end
