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

    puts "SIGN IN"
    login_as user

    puts "VISIT"
    visit bootstrap_checkboxes_path(account_id: account.id)

    puts "WAIT FOR CONTENT"
    wait_for_selector ".content-container"

    puts "CHECK"
    check task1.name

    puts "SUBMIT"
    wait_for_and_find("input[type=submit]").click

    puts "WAIT FOR SUBMIT"
    wait_for_browser { AccountMarkedTask.where(account: account, task: task1).any? }

    puts "EXPECT"
    expect(AccountMarkedTask.where(account: account, task: task2).any?).to eq false

    puts "DONE"
  end

  it "deletes the last relationship" do
    account_market_task1

    puts "LOGIN"
    login_as user

    puts "VISIT"
    visit bootstrap_checkboxes_path(account_id: account.id)

    puts "WAIT FOR CONTENT"
    wait_for_selector ".content-container"

    puts "CHECK"
    checkbox_input = wait_for_and_find("input[type='checkbox']")
    expect(checkbox_input[:checked]).to eq "true"

    puts "UNCHECK"
    uncheck task1.name

    puts "SUBMIT"
    wait_for_and_find("input[type=submit]").click

    wait_for_browser do
      puts "WAIT FOR BROWSER"
      account_market_task1.reload

      puts "FOUND AS NOT EXPECTED"
      false
    rescue ActiveRecord::RecordNotFound
      puts "NOT FOUND AS EXPECTED"
      true
    end

    puts "DONE"
  end
end
