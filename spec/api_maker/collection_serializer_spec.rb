require "rails_helper"

describe ApiMaker::CollectionSerializer do
  let!(:account) { create :account, id: 1 }
  let!(:project) { create :project, account: account, id: 2 }
  let!(:task) { create :task, id: 3, project: project, user: user }
  let!(:user) { create :user, id: 4 }

  it "preloads relationships" do
    collection = User.where(id: user.id)
    result = ApiMaker::CollectionSerializer.new(collection: collection, include_param: "tasks.project.account").result
    expect(result.fetch(:tasks).first.fetch(:project).fetch(:id)).to eq project.id
  end
end
