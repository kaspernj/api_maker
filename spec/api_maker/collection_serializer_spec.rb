require "rails_helper"

describe ApiMaker::CollectionSerializer do
  let!(:project) { create :project }
  let!(:task) { create :task, project: project, user: user }
  let!(:user) { create :user }

  it "preloads relationships" do
    collection = User.where(id: user.id)
    result = ApiMaker::CollectionSerializer.new(collection: collection, include_param: "tasks.project").result
    expect(result.fetch(:tasks).first.fetch(:project).fetch(:id)).to eq project.id
  end
end
