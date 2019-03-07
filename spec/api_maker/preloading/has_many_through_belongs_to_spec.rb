require "rails_helper"

describe "preloading has many through belongs to" do
  let!(:account) { create :account }
  let!(:marked_task) { create :account_marked_task, account: account, task: task }
  let!(:task) { create :task }

  let!(:another_account) { create :account }
  let!(:same_marked_task) { create :account_marked_task, account: another_account, task: task }

  it "preloads without messing it up" do
    collection = Account.where(id: account.id)
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, include_param: ["tasks"]).to_json)

    expect(result.fetch("included").length).to eq 1
  end
end
