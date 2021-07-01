require "rails_helper"

describe ApiMaker::SimpleModelErrors do
  let(:account) { create :account }
  let(:project) { create :project, account: account }

  it "handles models on deeply nested models" do
    account = build :account
    project = account.projects.build(name: "Test project")
    task = project.tasks.build

    expect(task).to be_invalid
    expect(project).to be_invalid
    expect(account).to be_invalid

    result = ApiMaker::SimpleModelErrors.execute!(model: account)

    expect(result).to eq ["Name can't be blank"]
  end
end
