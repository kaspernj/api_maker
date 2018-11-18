require "rails_helper"

describe ApiMaker::CollectionSerializer do
  let!(:account) { create :account, customer: customer, id: 1 }
  let!(:customer) { create :customer, id: 5 }
  let!(:project) { create :project, account: account, id: 2 }
  let!(:task) { create :task, id: 3, project: project, user: user }
  let!(:user) { create :user, id: 4 }

  it "preloads relationships" do
    collection = User.where(id: user.id)
    result = ApiMaker::CollectionSerializer.new(collection: collection, include_param: ["tasks.project.account", "tasks.account"]).result
    expect(result.fetch(:tasks).first.fetch(:project).fetch(:id)).to eq project.id
  end

  it "preloads has one through relationships" do
    collection = User.where(id: user.id)
    result = ApiMaker::CollectionSerializer.new(collection: collection, include_param: ["tasks.customer"]).result
    expect(result.fetch(:stub)).to eq "stub"
  end
end
