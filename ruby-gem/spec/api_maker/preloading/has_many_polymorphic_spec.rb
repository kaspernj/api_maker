require "rails_helper"

describe "preloading - has many polymorphic" do
  let!(:comment) { create :comment, resource: task }
  let!(:task) { create :task, project:, user: }
  let(:project) { create :project }

  let(:user) { create :user }
  let(:user_ability) { ApiMaker::Ability.new(api_maker_args: {current_user: user}) }

  it "preloads without messing it up" do
    collection = Task.where(id: [task.id])
    result = JSON.parse(ApiMaker::CollectionSerializer.new(ability: user_ability, collection:, query_params: {preload: ["comments"]}).to_json)

    expect(result.dig!("data", "tasks")).to eq [task.id]
    expect(result.dig!("preloaded", "tasks", task.id.to_s, "r", "comments")).to eq [comment.id]
  end
end
