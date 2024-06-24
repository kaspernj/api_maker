require "rails_helper"

describe "preloading - has many through belongs to" do
  let!(:account) { create :account }
  let!(:marked_task) { create :account_marked_task, account:, task: }
  let!(:task) { create :task, user: }

  let!(:another_account) { create :account }
  let!(:same_marked_task) { create :account_marked_task, account: another_account, task: }

  let(:user) { create :user }
  let(:user_ability) { ApiMaker::Ability.new(api_maker_args: {current_user: user}) }

  it "preloads without messing it up" do
    collection = Account.where(id: [account.id, another_account.id])
    result = JSON.parse(ApiMaker::CollectionSerializer.new(ability: user_ability, collection:, query_params: {preload: ["tasks"]}).to_json)

    expect(result.dig!("data", "accounts")).to eq [account.id, another_account.id]
    expect(result.dig!("preloaded", "accounts", account.id.to_s, "r", "tasks")).to eq [task.id]
    expect(result.dig!("preloaded", "accounts", another_account.id.to_s, "r", "tasks")).to eq [task.id]
    expect(result.dig!("preloaded", "tasks").length).to eq 1
  end
end
