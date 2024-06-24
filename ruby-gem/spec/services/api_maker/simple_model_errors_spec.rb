require "rails_helper"

describe ApiMaker::SimpleModelErrors do
  let(:account) { create :account }
  let(:project) { create :project, account: }

  it "handles models on deeply nested models" do
    account = build :account
    project = account.projects.build(name: "Test project")
    task = project.tasks.build

    expect(task).not_to be_valid
    expect(project).not_to be_valid
    expect(account).not_to be_valid

    result = ApiMaker::SimpleModelErrors.execute!(model: account)

    expect(result).to eq ["Name can't be blank"]
  end

  it "translates attributes" do
    I18n.with_locale(:da) do
      account = build :account
      project = account.projects.build(name: "Test project")
      task = project.tasks.build

      expect(task).not_to be_valid
      expect(project).not_to be_valid
      expect(account).not_to be_valid

      result = ApiMaker::SimpleModelErrors.execute!(model: account)

      expect(result).to eq ["Navn kan ikke være blank"]
    end
  end

  it "generates errors for sub models" do
    task = build :task
    task.project.name = ""

    expect(task).not_to be_valid

    errors = ApiMaker::SimpleModelErrors.execute!(model: task)

    expect(errors).to eq ["Name can't be blank"]
  end
end
