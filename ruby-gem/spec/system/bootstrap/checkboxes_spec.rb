require "rails_helper"

describe "bootstrap - checkboxes" do
  let(:account) { create :account }
  let(:account_market_task1) { create :account_marked_task, account:, task: task1 }
  let(:task1) { create :task, user: }
  let(:task2) { create :task, user: }
  let(:user) { create :user }

  it "adds a new relationships" do
    task1
    task2

    login_as user
    visit bootstrap_checkboxes_path(account_id: account.id)
    wait_for_selector ".content-container"
    check task1.name
    wait_for_and_find("input[type=submit]").click

    wait_for_browser { AccountMarkedTask.where(account:, task: task1).any? }

    expect(AccountMarkedTask.where(account:, task: task2).any?).to be false
  end

  it "deletes the last relationship" do
    account_market_task1

    login_as user
    visit bootstrap_checkboxes_path(account_id: account.id)
    wait_for_selector ".content-container"
    wait_for_selector "input[type='checkbox']:checked"
    uncheck task1.name
    wait_for_selector "input[type='checkbox']:not(:checked)"
    wait_for_and_find("input[type=submit]").click

    wait_for_browser do
      account_market_task1.reload

      false
    rescue ActiveRecord::RecordNotFound
      true
    end
  end
end
