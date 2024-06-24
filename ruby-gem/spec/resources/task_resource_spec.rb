require "rails_helper"

describe Resources::TaskResource do
  let(:task) { create :task }
  let(:task2) { create :task }
  let(:account_marked_task) { create :account_marked_task, id: 5, task: }
  let(:account_marked_task2) { create :account_marked_task, task: task2 }

  it "reads tasks through account marked tasks using a raw SQL rule" do
    account_marked_task
    account_marked_task2

    accessible_by = Task.accessible_by(ApiMaker::Ability.new)

    expect(accessible_by).to eq [task]
    expect(accessible_by.to_sql).to include "account_marked_tasks.id = 5"
  end
end
