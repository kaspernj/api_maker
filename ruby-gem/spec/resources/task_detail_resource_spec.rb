require "rails_helper"

describe Resources::TaskDetailResource do
  let(:task) { create :task, name: "Some readable task" }
  let(:task_detail) { create :task_detail, task: }
  let(:task_detail2) { create :task_detail }

  it "reads a task detail for a readable task" do
    task_detail
    task_detail2

    expect(TaskDetail.accessible_by(ApiMaker::Ability.new)).to eq [task_detail]
  end
end
