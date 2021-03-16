require "rails_helper"

describe Resources::TaskResource do
  let(:task) { create :task }
  let(:task2) { create :task }
  let(:account_marked_task) { create :account_marked_task, id: 5, task: task }

  it "reads account marked tasks for the task raw SQL rule" do
    account_marked_task
    task2

    accessible_by = Task.accessible_by(ApiMaker::Ability.new)
    expect(accessible_by).to eq [task]
  end
end

