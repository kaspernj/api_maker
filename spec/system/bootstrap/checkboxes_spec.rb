require "rails_helper"

describe "bootstrap - checkboxes" do
  let(:account) { create :account }
  let(:account_market_task1) { create :account_marked_task, account: account, task: task1 }
  let(:task1) { create :task, user: user }
  let(:task2) { create :task, user: user }
  let(:user) { create :user }

  it "adds new relationships" do
    task1
    task2

    login_as user

    visit bootstrap_checkboxes_path(account_id: account.id)

    wait_for_selector ".content-container"

    check task1.name

    find("input[type=submit]").click

    wait_for_chrome { AccountMarkedTask.where(account: account, task: task1).any? }

    expect(AccountMarkedTask.where(account: account, task: task2).any?).to eq false
  end

  it "deletes the last relationship" do
    account_market_task1

    login_as user

    visit bootstrap_checkboxes_path(account_id: account.id)

    wait_for_selector ".content-container"

    checkbox_input = find("input[type='checkbox']")
    expect(checkbox_input[:checked]).to eq "true"

    uncheck task1.name

    find("input[type=submit]").click

    wait_for_chrome do
      account_market_task1.reload
      false
    rescue ActiveRecord::RecordNotFound
      true
    end
  end
end
