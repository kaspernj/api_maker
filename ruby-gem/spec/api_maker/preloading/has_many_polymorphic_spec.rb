require "rails_helper"

describe "preloading - has many polymorphic" do
  let!(:comment) { create :comment, resource: task }
  let!(:task) { create :task, user: user }

  let(:user) { create :user }
  let(:user_ability) { ApiMaker::Ability.new(args: {current_user: user}) }

  it "preloads without messing it up" do
    collection = Task.where(id: [task.id])
    result = JSON.parse(ApiMaker::CollectionSerializer.new(ability: user_ability, collection: collection, query_params: {preload: ["comments"]}).to_json)

    expect(result.dig!("data", "tasks")).to eq [task.id]
    expect(result.dig!("preloaded", "tasks", task.id.to_s, "r", "comments")).to eq [comment.id]
  end

  it "adds a special type argument to the ransack for the models load method" do
    task_model = File.read(Rails.root.join("app/javascript/api-maker/models/task.js"))
    expect(task_model).to include '{"ransack":{"resource_id_eq":id,"resource_type_eq":"Task"}}'
  end
end
