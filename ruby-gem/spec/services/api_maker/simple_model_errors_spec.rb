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

  it "translates attributes" do
    I18n.with_locale(:da) do
      account = build :account
      project = account.projects.build(name: "Test project")
      task = project.tasks.build

      expect(task).to be_invalid
      expect(project).to be_invalid
      expect(account).to be_invalid

      result = ApiMaker::SimpleModelErrors.execute!(model: account)

      expect(result).to eq ["Navn kan ikke være blank"]
    end
  end

  it "generates errors for sub models" do
    task = build :task
    task.project.name = ""

    expect(task).to be_invalid

    errors = ApiMaker::SimpleModelErrors.execute!(model: task)

    expect(errors).to eq ["Name can't be blank"]
  end
end
